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
import { Proposal } from '../../proposal/entities/proposal.entity';
import { PingStatusEnum } from '../enums/ping-status.enum';

@Entity({ name: 'pb_ping' })
@Index('idx_ping_pinger', ['pingerId'])
@Index('idx_ping_pinged', ['pingedId'])
@Index('idx_ping_status', ['status'])
export class Ping extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @ManyToOne(() => Penguin, { eager: false })
  @JoinColumn({ name: 'pinger_id' })
  pinger: Penguin;

  @Column({ name: 'pinger_id', type: 'bigint' })
  pingerId: string;

  @ManyToOne(() => Penguin, { eager: false })
  @JoinColumn({ name: 'pinged_id' })
  pinged: Penguin;

  @Column({ name: 'pinged_id', type: 'bigint' })
  pingedId: string;

  @ManyToOne(() => Proposal, { eager: false })
  @JoinColumn({ name: 'proposal_id' })
  proposal: Proposal;

  @Column({ name: 'proposal_id', type: 'bigint' })
  proposalId: string;

  @Column({ name: 'status', type: 'enum', enum: PingStatusEnum, default: PingStatusEnum.PENDING })
  status: PingStatusEnum;

  @Column({ name: 'pinger_confirmed', type: 'boolean', default: false })
  pingerConfirmed: boolean;

  @Column({ name: 'pinged_confirmed', type: 'boolean', default: false })
  pingedConfirmed: boolean;

  @Column({ name: 'pc_released', type: 'boolean', default: false })
  pcReleased: boolean;

  @Column({ name: 'completed_date', type: 'timestamp', nullable: true })
  completedDate?: Date | null;

  @Column({ name: 'message', type: 'varchar', length: 1000, nullable: true })
  message?: string | null;
}
