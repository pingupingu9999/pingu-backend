import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Penguin } from '../../penguin/entities/penguin.entity';

export enum NotificationTypeEnum {
  PING_RECEIVED     = 'PING_RECEIVED',
  PING_ACCEPTED     = 'PING_ACCEPTED',
  PING_REJECTED     = 'PING_REJECTED',
  PING_CONFIRMED    = 'PING_CONFIRMED',
  PING_COMPLETED    = 'PING_COMPLETED',
  PC_EARNED         = 'PC_EARNED',
  REFERRAL_REWARD   = 'REFERRAL_REWARD',
  SYSTEM            = 'SYSTEM',
}

@Entity({ name: 'pb_notification' })
@Index('idx_notification_penguin', ['penguinId'])
@Index('idx_notification_read', ['penguinId', 'isRead'])
export class Notification extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @ManyToOne(() => Penguin, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'penguin_id' })
  penguin: Penguin;

  @Column({ name: 'penguin_id', type: 'bigint' })
  penguinId: string;

  @Column({ name: 'type', type: 'varchar', length: 50 })
  type: NotificationTypeEnum;

  @Column({ name: 'title', type: 'varchar', length: 200 })
  title: string;

  @Column({ name: 'body', type: 'varchar', length: 1000, nullable: true })
  body?: string | null;

  @Column({ name: 'data', type: 'jsonb', nullable: true })
  data?: Record<string, unknown> | null;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date | null;
}
