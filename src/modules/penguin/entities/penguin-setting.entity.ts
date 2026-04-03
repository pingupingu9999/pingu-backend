import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Penguin } from './penguin.entity';

@Entity({ name: 'pb_penguin_setting' })
export class PenguinSetting extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @ManyToOne(() => Penguin, (p) => p.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'penguin_id' })
  penguin: Penguin;

  @Column({ name: 'penguin_id', type: 'bigint' })
  penguinId: string;

  @Column({ name: 'setting_key', type: 'varchar', length: 100 })
  settingKey: string;

  @Column({ name: 'setting_value', type: 'varchar', length: 500, nullable: true })
  settingValue?: string | null;
}
