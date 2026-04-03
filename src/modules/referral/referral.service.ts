import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral, ReferralStatusEnum } from './entities/referral.entity';
import { PenguinService } from '../penguin/penguin.service';
import { WalletService } from '../wallet/wallet.service';
import { IncomeTypeEnum } from '../wallet/enums/income-type.enum';

@Injectable()
export class ReferralService {
  constructor(
    @InjectRepository(Referral)
    private readonly referralRepository: Repository<Referral>,
    private readonly penguinService: PenguinService,
    private readonly walletService: WalletService,
    private readonly configService: ConfigService,
  ) {}

  /** Generate a referral code for the current user */
  async generateCode(userId: string): Promise<{ code: string }> {
    const penguin = await this.penguinService.findByUserId(userId);
    const code = `PINGU-${penguin.id.toString().padStart(6, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    return { code };
  }

  /** Apply a referral code during registration (called after user + penguin are created) */
  async applyCode(referredUserId: string, code: string): Promise<void> {
    const referredPenguin = await this.penguinService.findByUserId(referredUserId);
    const earlyAdopterLimit = this.configService.get<number>('EARLY_ADOPTER_LIMIT', 1000);

    // Find the referral code owner
    const codeOwnerId = this.extractPenguinIdFromCode(code);
    if (!codeOwnerId) throw new BadRequestException('Invalid referral code');

    let referrerPenguin: Awaited<ReturnType<typeof this.penguinService.findById>>;
    try {
      referrerPenguin = await this.penguinService.findById(codeOwnerId);
    } catch {
      throw new BadRequestException('Referral code not found');
    }

    if (referrerPenguin.id === referredPenguin.id) {
      throw new BadRequestException('Cannot use your own referral code');
    }

    const existing = await this.referralRepository.findOne({
      where: { referrerId: referrerPenguin.id, referredId: referredPenguin.id },
    });
    if (existing) throw new BadRequestException('Referral already used');

    // Check early adopter total count
    const totalUsers = await this.referralRepository
      .createQueryBuilder('r')
      .select('COUNT(*)', 'count')
      .getRawOne<{ count: string }>();
    const totalReferrals = parseInt(totalUsers?.count ?? '0', 10);

    const referral = this.referralRepository.create({
      referrerId: referrerPenguin.id,
      referredId: referredPenguin.id,
      referralCode: code,
      status: ReferralStatusEnum.PENDING,
      createdBy: referredUserId,
    });
    await this.referralRepository.save(referral);

    // Only reward if within early adopter limit
    if (totalReferrals < earlyAdopterLimit) {
      const reward = this.configService.get<number>('REFERRAL_REWARD', 10);
      await this.walletService.credit(
        referrerPenguin.id,
        IncomeTypeEnum.REFERRAL,
        reward,
        `Referral reward for inviting user`,
        undefined,
        'system',
      );
      referral.status = ReferralStatusEnum.COMPLETED;
      referral.rewarded = true;
      await this.referralRepository.save(referral);
    }
  }

  async getMyReferrals(userId: string): Promise<Referral[]> {
    const penguin = await this.penguinService.findByUserId(userId);
    return this.referralRepository.find({
      where: { referrerId: penguin.id },
      order: { createdDate: 'DESC' },
    });
  }

  private extractPenguinIdFromCode(code: string): string | null {
    // Code format: PINGU-000123-XXXX
    const match = code.match(/^PINGU-(\d+)-[A-Z0-9]{4}$/);
    if (!match) return null;
    return parseInt(match[1], 10).toString();
  }
}
