import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserDeletedAt1744190400005 implements MigrationInterface {
  name = 'AddUserDeletedAt1744190400005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pb_user" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pb_user" DROP COLUMN IF EXISTS "deleted_at"
    `);
  }
}
