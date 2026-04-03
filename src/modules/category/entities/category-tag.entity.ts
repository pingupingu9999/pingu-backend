import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Category } from './category.entity';

@Entity({ name: 'pb_category_tag' })
export class CategoryTag extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @ManyToOne(() => Category, (c) => c.tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id', type: 'bigint' })
  categoryId: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'description', type: 'varchar', length: 500, nullable: true })
  description?: string | null;

  @Column({ name: 'emoji', type: 'varchar', length: 10, nullable: true })
  emoji?: string | null;

  @Column({ name: 'active', type: 'boolean', default: true })
  active: boolean;
}
