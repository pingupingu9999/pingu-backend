import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class AuditableEntity {
  @Column({ name: 'created_by', type: 'varchar', length: 50 })
  createdBy: string;

  @CreateDateColumn({ name: 'created_date', type: 'timestamp' })
  createdDate: Date;

  @Column({ name: 'last_modified_by', type: 'varchar', length: 50, nullable: true })
  lastModifiedBy?: string | null;

  @UpdateDateColumn({ name: 'last_modified_date', type: 'timestamp', nullable: true })
  lastModifiedDate?: Date | null;
}