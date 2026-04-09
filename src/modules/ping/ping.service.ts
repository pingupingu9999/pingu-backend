import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Ping } from './entities/ping.entity';
import { DailyLimit } from './entities/daily-limit.entity';
import { PingStatusEnum } from './enums/ping-status.enum';
import { CreatePingDto } from './dto/create-ping.dto';
import { PenguinService } from '../penguin/penguin.service';
import { ProposalService } from '../proposal/proposal.service';
import { WalletService } from '../wallet/wallet.service';
import { IncomeTypeEnum } from '../wallet/enums/income-type.enum';
import { NotificationService } from '../notification/notification.service';
import { NotificationTypeEnum } from '../notification/entities/notification.entity';

@Injectable()
export class PingService {
  constructor(
    @InjectRepository(Ping)
    private readonly pingRepository: Repository<Ping>,
    @InjectRepository(DailyLimit)
    private readonly dailyLimitRepository: Repository<DailyLimit>,
    private readonly penguinService: PenguinService,
    private readonly proposalService: ProposalService,
    private readonly walletService: WalletService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async createPing(userId: string, dto: CreatePingDto): Promise<Ping> {
    const pinger = await this.penguinService.findByUserId(userId);
    const proposal = await this.proposalService.findById(dto.proposalId);
    const pingedTag = proposal.penguinCategoryTag;
    const pingedId = pingedTag.penguinId;

    if (pinger.id === pingedId) {
      throw new BadRequestException('Cannot ping yourself');
    }

    // Verify pingee is active
    const isActive = await this.penguinService.isActive(pingedId);
    if (!isActive) throw new BadRequestException('This user is not accepting pings');

    // Daily limit checks
    const maxDailyPings = this.configService.get<number>('MAX_DAILY_PINGS', 20);
    const today = new Date().toISOString().split('T')[0];
    const dailyLimit = await this.getOrCreateDailyLimit(pinger.id, today);
    if (dailyLimit.pingsSent >= maxDailyPings) {
      throw new BadRequestException('Daily ping limit reached');
    }

    // Cooldown check: max 1 ping to same user per 24h
    const cooldownHours = this.configService.get<number>('PING_COOLDOWN_HOURS', 24);
    const cooldownDate = new Date(Date.now() - cooldownHours * 3600 * 1000);
    const recentPing = await this.pingRepository
      .createQueryBuilder('p')
      .where('p.pingerId = :pingerId', { pingerId: pinger.id })
      .andWhere('p.pingedId = :pingedId', { pingedId })
      .andWhere('p.createdDate > :cooldownDate', { cooldownDate })
      .getOne();
    if (recentPing) {
      throw new BadRequestException('You already pinged this user recently, please wait 24h');
    }

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const ping = qr.manager.create(Ping, {
        pingerId: pinger.id,
        pingedId,
        proposalId: dto.proposalId,
        message: dto.message,
        status: PingStatusEnum.PENDING,
        createdBy: userId,
      });
      const saved = await qr.manager.save(Ping, ping);

      // Increment daily pings counter
      dailyLimit.pingsSent += 1;
      await qr.manager.save(DailyLimit, dailyLimit);

      await qr.commitTransaction();

      // Notify the pinged user
      await this.notificationService.create(
        pingedId,
        NotificationTypeEnum.PING_RECEIVED,
        'Hai ricevuto un ping!',
        `Qualcuno è interessato alla tua proposta`,
        { pingId: saved.id, proposalId: dto.proposalId },
      ).catch(() => null);

      return saved;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async respond(pingId: string, userId: string, accept: boolean): Promise<Ping> {
    const ping = await this.findById(pingId);
    const penguin = await this.penguinService.findByUserId(userId);
    if (ping.pingedId !== penguin.id) throw new ForbiddenException();
    if (ping.status !== PingStatusEnum.PENDING) {
      throw new BadRequestException('Ping is not in PENDING state');
    }
    ping.status = accept ? PingStatusEnum.ACCEPTED : PingStatusEnum.REJECTED;
    ping.lastModifiedBy = userId;
    const saved = await this.pingRepository.save(ping);

    // Notify the pinger
    await this.notificationService.create(
      ping.pingerId,
      accept ? NotificationTypeEnum.PING_ACCEPTED : NotificationTypeEnum.PING_REJECTED,
      accept ? 'Il tuo ping è stato accettato!' : 'Il tuo ping è stato rifiutato',
      undefined,
      { pingId: ping.id },
    ).catch(() => null);

    return saved;
  }

  async confirm(pingId: string, userId: string): Promise<Ping> {
    const ping = await this.findById(pingId);
    const penguin = await this.penguinService.findByUserId(userId);

    const isPinger = ping.pingerId === penguin.id;
    const isPinged = ping.pingedId === penguin.id;
    if (!isPinger && !isPinged) throw new ForbiddenException();

    if (![PingStatusEnum.ACCEPTED, PingStatusEnum.IN_PROGRESS, PingStatusEnum.PINGER_CONFIRMED, PingStatusEnum.PINGED_CONFIRMED].includes(ping.status)) {
      throw new BadRequestException('Ping cannot be confirmed in its current state');
    }

    if (isPinger) ping.pingerConfirmed = true;
    if (isPinged) ping.pingedConfirmed = true;

    // Update status based on confirmations
    if (ping.pingerConfirmed && ping.pingedConfirmed) {
      ping.status = PingStatusEnum.COMPLETED;
      ping.completedDate = new Date();
    } else if (ping.pingerConfirmed) {
      ping.status = PingStatusEnum.PINGER_CONFIRMED;
    } else {
      ping.status = PingStatusEnum.PINGED_CONFIRMED;
    }

    ping.lastModifiedBy = userId;
    const saved = await this.pingRepository.save(ping);

    // Release pc when both confirmed
    if (saved.status === PingStatusEnum.COMPLETED && !saved.pcReleased) {
      await this.releasePc(saved, userId);

      // Notify both parties
      await Promise.all([
        this.notificationService.create(
          ping.pingerId,
          NotificationTypeEnum.PING_COMPLETED,
          'Servizio completato! Hai guadagnato pc.',
          undefined,
          { pingId: ping.id },
        ).catch(() => null),
        this.notificationService.create(
          ping.pingedId,
          NotificationTypeEnum.PING_COMPLETED,
          'Servizio completato! Hai guadagnato pc.',
          undefined,
          { pingId: ping.id },
        ).catch(() => null),
      ]);
    }

    return saved;
  }

  async dispute(pingId: string, userId: string): Promise<Ping> {
    const ping = await this.findById(pingId);
    const penguin = await this.penguinService.findByUserId(userId);
    if (ping.pingerId !== penguin.id && ping.pingedId !== penguin.id) throw new ForbiddenException();
    ping.status = PingStatusEnum.DISPUTED;
    ping.lastModifiedBy = userId;
    return this.pingRepository.save(ping);
  }

  async findById(id: string): Promise<Ping> {
    const ping = await this.pingRepository.findOne({
      where: { id },
      relations: ['proposal', 'proposal.penguinCategoryTag'],
    });
    if (!ping) throw new NotFoundException('Ping not found');
    return ping;
  }

  async findMyPings(userId: string, page = 0, size = 20): Promise<[Ping[], number]> {
    const penguin = await this.penguinService.findByUserId(userId);
    return this.pingRepository.findAndCount({
      where: [{ pingerId: penguin.id }, { pingedId: penguin.id }],
      order: { createdDate: 'DESC' },
      skip: page * size,
      take: size,
    });
  }

  private async releasePc(ping: Ping, actor: string): Promise<void> {
    const pingRewardPinged = this.configService.get<number>('PING_REWARD_PINGED', 5);
    const pingRewardPinger = this.configService.get<number>('PING_REWARD_PINGER', 1);
    const dailyPcCap = this.configService.get<number>('DAILY_PC_CAP', 50);
    const today = new Date().toISOString().split('T')[0];

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      // Check daily pc cap
      const pingerLimit = await this.getOrCreateDailyLimit(ping.pingerId, today);
      const pingedLimit = await this.getOrCreateDailyLimit(ping.pingedId, today);

      const pingerEarns = Math.min(pingRewardPinger, dailyPcCap - pingerLimit.pcEarned);
      const pingedEarns = Math.min(pingRewardPinged, dailyPcCap - pingedLimit.pcEarned);

      if (pingerEarns > 0) {
        await this.walletService.credit(
          ping.pingerId,
          IncomeTypeEnum.PING_SENT,
          pingerEarns,
          `Ping confirmed (sent)`,
          { pingId: ping.id, proposalId: ping.proposalId },
          'system',
          qr,
        );
        pingerLimit.pcEarned += pingerEarns;
        await qr.manager.save(DailyLimit, pingerLimit);
      }

      if (pingedEarns > 0) {
        await this.walletService.credit(
          ping.pingedId,
          IncomeTypeEnum.PING_RECEIVED,
          pingedEarns,
          `Ping confirmed (received)`,
          { pingId: ping.id, proposalId: ping.proposalId },
          'system',
          qr,
        );
        pingedLimit.pcEarned += pingedEarns;
        await qr.manager.save(DailyLimit, pingedLimit);
      }

      ping.pcReleased = true;
      ping.lastModifiedBy = actor;
      await qr.manager.save(Ping, ping);

      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  private async getOrCreateDailyLimit(penguinId: string, date: string): Promise<DailyLimit> {
    let limit = await this.dailyLimitRepository.findOne({
      where: { penguinId, limitDate: date },
    });
    if (!limit) {
      limit = this.dailyLimitRepository.create({ penguinId, limitDate: date, pingsSent: 0, pcEarned: 0 });
      limit = await this.dailyLimitRepository.save(limit);
    }
    return limit;
  }
}
