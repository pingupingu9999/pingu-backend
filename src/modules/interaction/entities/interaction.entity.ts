import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';

@Entity({ name: 'pb_interaction' })
export class Interaction extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'description', type: 'varchar', length: 500, nullable: true })
  description?: string | null;

  @Column({ name: 'emoji', type: 'varchar', length: 10, nullable: true })
  emoji?: string | null;

  @Column({ name: 'active', type: 'boolean', default: true })
  active: boolean;
}
