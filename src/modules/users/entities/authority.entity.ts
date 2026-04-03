import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'pb_authority' })
export class Authority {
  @PrimaryColumn({ name: 'name', type: 'varchar', length: 50 })
  name: string;
}