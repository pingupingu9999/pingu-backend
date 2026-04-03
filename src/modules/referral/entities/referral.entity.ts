import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Penguin } from '../../penguin/entities/penguin.entity';

export enum ReferralStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

@Entity({ name: 'pb_referral' })
@Unique('uq_referral_pair', ['referrerId', 'referredId'])
export class Referral extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @ManyToOne(() => Penguin)
  @JoinColumn({ name: 'referrer_id' })
  referrer: Penguin;

  @Column({ name: 'referrer_id', type: 'bigint' })
  referrerId: string;

  @ManyToOne(() => Penguin)
  @JoinColumn({ name: 'referred_id' })
  referred: Penguin;

  @Column({ name: 'referred_id', type: 'bigint' })
  referredId: string;

  @Column({ name: 'referral_code', type: 'varchar', length: 20, unique: true })
  referralCode: string;

  @Column({ name: 'status', type: 'varchar', length: 20, default: ReferralStatusEnum.PENDING })
  status: ReferralStatusEnum;

  @Column({ name: 'rewarded', type: 'boolean', default: false })
  rewarded: boolean;
}
