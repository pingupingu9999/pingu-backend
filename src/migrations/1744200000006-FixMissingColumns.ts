import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixMissingColumns1744200000006 implements MigrationInterface {
  name = 'FixMissingColumns1744200000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pb_notification" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP NULL`);
    await queryRunner.query(`ALTER TABLE "pb_proposal_attachment" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pb_proposal_attachment" DROP COLUMN IF EXISTS "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "pb_notification" DROP COLUMN IF EXISTS "deleted_at"`);
  }
}
