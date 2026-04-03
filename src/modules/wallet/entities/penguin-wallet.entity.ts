import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Penguin } from '../../penguin/entities/penguin.entity';
import { CoinBundle } from './coin-bundle.entity';
import { IncomeTypeEnum } from '../enums/income-type.enum';

@Entity({ name: 'pb_penguin_wallet' })
export class PenguinWallet extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @ManyToOne(() => Penguin, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'penguin_id' })
  penguin: Penguin;

  @Column({ name: 'penguin_id', type: 'bigint' })
  penguinId: string;

  @Column({ name: 'income_type', type: 'enum', enum: IncomeTypeEnum })
  incomeType: IncomeTypeEnum;

  @Column({ name: 'quantity', type: 'numeric', precision: 12, scale: 2 })
  quantity: number;

  @Column({ name: 'description', type: 'varchar', length: 500, nullable: true })
  description?: string | null;

  @ManyToOne(() => CoinBundle, { nullable: true, eager: false })
  @JoinColumn({ name: 'coin_bundle_id' })
  coinBundle?: CoinBundle | null;

  @Column({ name: 'coin_bundle_id', type: 'bigint', nullable: true })
  coinBundleId?: string | null;

  @Column({ name: 'proposal_id', type: 'bigint', nullable: true })
  proposalId?: string | null;

  @Column({ name: 'ping_id', type: 'bigint', nullable: true })
  pingId?: string | null;
}
