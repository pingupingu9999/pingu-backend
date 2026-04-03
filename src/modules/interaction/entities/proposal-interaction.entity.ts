import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Penguin } from '../../penguin/entities/penguin.entity';
import { Proposal } from '../../proposal/entities/proposal.entity';
import { Interaction } from './interaction.entity';

@Entity({ name: 'pb_proposal_interaction' })
export class ProposalInteraction extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @ManyToOne(() => Penguin, { eager: false })
  @JoinColumn({ name: 'penguin_id' })
  penguin: Penguin;

  @Column({ name: 'penguin_id', type: 'bigint' })
  penguinId: string;

  @ManyToOne(() => Proposal, { eager: false })
  @JoinColumn({ name: 'proposal_id' })
  proposal: Proposal;

  @Column({ name: 'proposal_id', type: 'bigint' })
  proposalId: string;

  @ManyToOne(() => Interaction, { eager: true })
  @JoinColumn({ name: 'interaction_id' })
  interaction: Interaction;

  @Column({ name: 'interaction_id', type: 'bigint' })
  interactionId: string;

  @Column({ name: 'emoji', type: 'varchar', length: 10, nullable: true })
  emoji?: string | null;
}
