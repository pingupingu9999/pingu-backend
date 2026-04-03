import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';

@Entity({ name: 'pb_coin_bundle' })
export class CoinBundle extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'description', type: 'varchar', length: 500, nullable: true })
  description?: string | null;

  @Column({ name: 'price', type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'quantity', type: 'integer' })
  quantity: number;

  @Column({ name: 'discount', type: 'numeric', precision: 5, scale: 2, default: 0 })
  discount: number;

  @Column({ name: 'active', type: 'boolean', default: true })
  active: boolean;
}
