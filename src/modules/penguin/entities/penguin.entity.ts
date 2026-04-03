import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { User } from '../../users/entities/user.entity';
import { PenguinMeta } from './penguin-meta.entity';
import { PenguinSetting } from './penguin-setting.entity';

@Entity({ name: 'pb_penguin' })
export class Penguin extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @OneToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'bio', type: 'varchar', length: 500, nullable: true })
  bio?: string | null;

  @Column({ name: 'description', type: 'varchar', length: 2000, nullable: true })
  description?: string | null;

  @Column({ name: 'note', type: 'varchar', length: 1000, nullable: true })
  note?: string | null;

  @Column({ name: 'radius', type: 'int', nullable: true })
  radius?: number | null;

  @Column({ name: 'latitude', type: 'numeric', precision: 10, scale: 7, nullable: true })
  latitude?: number | null;

  @Column({ name: 'longitude', type: 'numeric', precision: 10, scale: 7, nullable: true })
  longitude?: number | null;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date | null;

  @OneToMany(() => PenguinMeta, (meta) => meta.penguin, { cascade: true })
  metas: PenguinMeta[];

  @OneToMany(() => PenguinSetting, (setting) => setting.penguin, { cascade: true })
  settings: PenguinSetting[];
}
