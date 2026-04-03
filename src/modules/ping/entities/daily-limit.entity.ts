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

@Entity({ name: 'pb_daily_limit' })
@Unique('uq_daily_limit', ['penguinId', 'limitDate'])
export class DailyLimit extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @ManyToOne(() => Penguin, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'penguin_id' })
  penguin: Penguin;

  @Column({ name: 'penguin_id', type: 'bigint' })
  penguinId: string;

  @Column({ name: 'limit_date', type: 'date' })
  limitDate: string;

  @Column({ name: 'pings_sent', type: 'integer', default: 0 })
  pingsSent: number;

  @Column({ name: 'pc_earned', type: 'integer', default: 0 })
  pcEarned: number;
}
