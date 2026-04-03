import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { PenguinCategoryTag } from '../../tag/entities/penguin-category-tag.entity';
import { ProposalAttachment } from './proposal-attachment.entity';
import { ProposalTypeEnum } from '../enums/proposal-type.enum';

@Entity({ name: 'pb_proposal' })
export class Proposal extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @ManyToOne(() => PenguinCategoryTag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'penguin_category_tag_id' })
  penguinCategoryTag: PenguinCategoryTag;

  @Column({ name: 'penguin_category_tag_id', type: 'bigint' })
  penguinCategoryTagId: string;

  @Column({ name: 'name', type: 'varchar', length: 200 })
  name: string;

  @Column({ name: 'description', type: 'varchar', length: 3000, nullable: true })
  description?: string | null;

  @Column({ name: 'proposal_type', type: 'enum', enum: ProposalTypeEnum })
  proposalType: ProposalTypeEnum;

  @Column({ name: 'guests', type: 'int', nullable: true })
  guests?: number | null;

  @Column({ name: 'radius', type: 'int', nullable: true })
  radius?: number | null;

  @Column({ name: 'latitude', type: 'numeric', precision: 10, scale: 7, nullable: true })
  latitude?: number | null;

  @Column({ name: 'longitude', type: 'numeric', precision: 10, scale: 7, nullable: true })
  longitude?: number | null;

  @Column({ name: 'start_date', type: 'timestamp', nullable: true })
  startDate?: Date | null;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate?: Date | null;

  @Column({ name: 'is_private', type: 'boolean', default: false })
  isPrivate: boolean;

  @Column({ name: 'acceptance', type: 'boolean', default: false })
  acceptance: boolean;

  @Column({ name: 'active', type: 'boolean', default: true })
  active: boolean;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date | null;

  @OneToMany(() => ProposalAttachment, (a) => a.proposal, { cascade: true })
  attachments: ProposalAttachment[];
}
