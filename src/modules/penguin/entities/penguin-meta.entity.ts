import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Penguin } from './penguin.entity';

@Entity({ name: 'pb_penguin_meta' })
export class PenguinMeta extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @ManyToOne(() => Penguin, (p) => p.metas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'penguin_id' })
  penguin: Penguin;

  @Column({ name: 'penguin_id', type: 'bigint' })
  penguinId: string;

  @Column({ name: 'meta_key', type: 'varchar', length: 100 })
  metaKey: string;

  @Column({ name: 'meta_value', type: 'varchar', length: 1000, nullable: true })
  metaValue?: string | null;
}
