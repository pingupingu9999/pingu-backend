import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CoinBundle } from './entities/coin-bundle.entity';
import { PenguinWallet } from './entities/penguin-wallet.entity';
import { IncomeTypeEnum } from './enums/income-type.enum';

const keyBalance = (penguinId: string) => `wallet:balance:${penguinId}`;
const KEY_BUNDLES = 'wallet:bundles';
const BALANCE_TTL = 30_000;  // 30s — solo per display, debit usa sempre il DB
const BUNDLES_TTL = 3_600_000; // 1 ora

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(PenguinWallet)
    private readonly walletRepository: Repository<PenguinWallet>,
    @InjectRepository(CoinBundle)
    private readonly bundleRepository: Repository<CoinBundle>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  /**
   * Calcola il saldo come SUM() del ledger.
   * Quando viene passato un QueryRunner (dentro una transazione), legge sempre dal DB.
   * Senza QueryRunner usa la cache a 30s — safe perché debit() passa sempre un QR.
   */
  async getBalance(penguinId: string, qr?: QueryRunner): Promise<number> {
    if (!qr) {
      const cached = await this.cache.get<number>(keyBalance(penguinId));
      if (cached !== null && cached !== undefined) return cached;
    }

    const manager = qr ? qr.manager : this.walletRepository.manager;
    const result = await manager
      .createQueryBuilder(PenguinWallet, 'w')
      .select('COALESCE(SUM(w.quantity), 0)', 'balance')
      .where('w.penguinId = :penguinId', { penguinId })
      .getRawOne<{ balance: string }>();
    const balance = parseFloat(result?.balance ?? '0');

    if (!qr) {
      await this.cache.set(keyBalance(penguinId), balance, BALANCE_TTL);
    }
    return balance;
  }

  async getTransactions(
    penguinId: string,
    page = 0,
    size = 20,
  ): Promise<[PenguinWallet[], number]> {
    return this.walletRepository.findAndCount({
      where: { penguinId },
      order: { createdDate: 'DESC' },
      skip: page * size,
      take: size,
    });
  }

  async credit(
    penguinId: string,
    incomeType: IncomeTypeEnum,
    quantity: number,
    description?: string,
    meta?: { pingId?: string; proposalId?: string; coinBundleId?: string },
    actor?: string,
    qr?: QueryRunner,
  ): Promise<PenguinWallet> {
    const entry = this.walletRepository.create({
      penguinId,
      incomeType,
      quantity,
      description,
      pingId: meta?.pingId,
      proposalId: meta?.proposalId,
      coinBundleId: meta?.coinBundleId,
      createdBy: actor ?? 'system',
    });
    const saved = qr
      ? await qr.manager.save(PenguinWallet, entry)
      : await this.walletRepository.save(entry);

    // Invalida la cache del saldo — safe anche se dentro una transazione
    await this.cache.del(keyBalance(penguinId));
    return saved;
  }

  /**
   * Atomic debit: balance check + insert avvengono nella stessa transazione
   * SERIALIZABLE per evitare race condition (double-spend).
   * Se viene passato un QueryRunner esterno, lo usa (il chiamante gestisce la transazione).
   * Altrimenti apre una nuova transazione interna.
   */
  async debit(
    penguinId: string,
    incomeType: IncomeTypeEnum,
    quantity: number,
    description?: string,
    meta?: { pingId?: string; proposalId?: string },
    actor?: string,
    qr?: QueryRunner,
  ): Promise<PenguinWallet> {
    if (qr) {
      const balance = await this.getBalance(penguinId, qr);
      if (balance < quantity) {
        throw new BadRequestException('Insufficient pinguCoin balance');
      }
      return this.credit(penguinId, incomeType, -quantity, description, meta, actor, qr);
    }

    const internalQr = this.dataSource.createQueryRunner();
    await internalQr.connect();
    await internalQr.startTransaction('SERIALIZABLE');
    try {
      const balance = await this.getBalance(penguinId, internalQr);
      if (balance < quantity) {
        throw new BadRequestException('Insufficient pinguCoin balance');
      }
      const entry = await this.credit(
        penguinId,
        incomeType,
        -quantity,
        description,
        meta,
        actor,
        internalQr,
      );
      await internalQr.commitTransaction();
      this.logger.debug(`Debit ${quantity}pc from penguin ${penguinId} (${incomeType})`);
      return entry;
    } catch (err) {
      await internalQr.rollbackTransaction();
      throw err;
    } finally {
      await internalQr.release();
    }
  }

  async grantSignupBonus(penguinId: string): Promise<PenguinWallet> {
    const bonus = this.configService.get<number>('SIGNUP_BONUS_PC', 100);
    this.logger.log(`Granting signup bonus ${bonus}pc to penguin ${penguinId}`);
    return this.credit(
      penguinId,
      IncomeTypeEnum.SIGNUP_BONUS,
      bonus,
      'Welcome bonus',
      undefined,
      'system',
    );
  }

  async findAllBundles(): Promise<CoinBundle[]> {
    const cached = await this.cache.get<CoinBundle[]>(KEY_BUNDLES);
    if (cached) return cached;
    const data = await this.bundleRepository.find({ where: { active: true } });
    await this.cache.set(KEY_BUNDLES, data, BUNDLES_TTL);
    return data;
  }

  async findBundleById(id: string): Promise<CoinBundle> {
    const bundle = await this.bundleRepository.findOne({ where: { id } });
    if (!bundle) throw new NotFoundException('CoinBundle not found');
    return bundle;
  }

  async createBundle(data: Partial<CoinBundle>, actor: string): Promise<CoinBundle> {
    const bundle = this.bundleRepository.create({ ...data, createdBy: actor });
    const saved = await this.bundleRepository.save(bundle);
    await this.cache.del(KEY_BUNDLES);
    return saved;
  }
}
