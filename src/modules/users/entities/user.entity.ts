import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Authority } from './authority.entity';
import { SexEnum } from '../enums/sex.enum';

@Entity({ name: 'pb_user' })
export class User extends AuditableEntity {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: string;

  @Column({
    name: 'login',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  login: string;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 100,
    nullable: true,
    select: false,
  })
  password?: string | null;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  firstName?: string | null;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  lastName?: string | null;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: true,
  })
  email?: string | null;

  @Column({
    name: 'tax_code',
    type: 'varchar',
    length: 256,
    nullable: true,
  })
  taxCode?: string | null;

  @Column({
    name: 'vat_number',
    type: 'varchar',
    length: 256,
    nullable: true,
  })
  vatNumber?: string | null;

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  phone?: string | null;

  @Column({
    name: 'sex',
    type: 'enum',
    enum: SexEnum,
    nullable: true,
  })
  sex?: SexEnum | null;

  @Column({
    name: 'birthday',
    type: 'timestamp',
    nullable: true,
  })
  birthday?: Date | null;

  @Column({
    name: 'activated',
    type: 'boolean',
    default: false,
    nullable: true,
  })
  activated?: boolean | null;

  @Column({
    name: 'lang_key',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  langKey?: string | null;

  @Column({
    name: 'image_url',
    type: 'varchar',
    length: 256,
    nullable: true,
  })
  imageUrl?: string | null;

  @Column({
    name: 'activation_key',
    type: 'varchar',
    length: 20,
    nullable: true,
    select: false,
  })
  activationKey?: string | null;

  @Column({
    name: 'reset_key',
    type: 'varchar',
    length: 20,
    nullable: true,
    select: false,
  })
  resetKey?: string | null;

  @Column({
    name: 'reset_date',
    type: 'timestamp',
    nullable: true,
  })
  resetDate?: Date | null;

  @Column({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt?: Date | null;

  @ManyToMany(() => Authority, { eager: false })
  @JoinTable({
    name: 'pb_user_authority',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'authority_name',
      referencedColumnName: 'name',
    },
  })
  authorities: Authority[];

  @BeforeInsert()
  @BeforeUpdate()
  normalizeLogin() {
    if (this.login) {
      this.login = this.login.toLowerCase();
    }
  }
}