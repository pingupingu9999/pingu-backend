import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Penguin } from '../../penguin/entities/penguin.entity';
import { CategoryTag } from '../../category/entities/category-tag.entity';

@Entity({ name: 'pb_penguin_category_tag' })
export class PenguinCategoryTag extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @ManyToOne(() => Penguin, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'penguin_id' })
  penguin: Penguin;

  @Column({ name: 'penguin_id', type: 'bigint' })
  penguinId: string;

  @ManyToOne(() => CategoryTag, { eager: true })
  @JoinColumn({ name: 'category_tag_id' })
  categoryTag: CategoryTag;

  @Column({ name: 'category_tag_id', type: 'bigint' })
  categoryTagId: string;

  @Column({ name: 'custom_name', type: 'varchar', length: 100 })
  customName: string;

  @Column({ name: 'description', type: 'varchar', length: 1000, nullable: true })
  description?: string | null;

  @Column({ name: 'radius', type: 'int', nullable: true })
  radius?: number | null;

  @Column({ name: 'latitude', type: 'numeric', precision: 10, scale: 7, nullable: true })
  latitude?: number | null;

  @Column({ name: 'longitude', type: 'numeric', precision: 10, scale: 7, nullable: true })
  longitude?: number | null;

  @Column({ name: 'active', type: 'boolean', default: true })
  active: boolean;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date | null;
}
