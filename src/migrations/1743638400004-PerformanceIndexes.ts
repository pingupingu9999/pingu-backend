import { MigrationInterface, QueryRunner } from 'typeorm';

export class PerformanceIndexes1743638400004 implements MigrationInterface {
  name = 'PerformanceIndexes1743638400004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // pb_penguin_wallet — critico per il calcolo del saldo (SUM) e listing transazioni
    await queryRunner.query(`
      CREATE INDEX idx_wallet_penguin
      ON pb_penguin_wallet(penguin_id)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_wallet_penguin_date
      ON pb_penguin_wallet(penguin_id, created_date DESC)
    `);

    // pb_proposal — filtri usati in ogni query di search
    await queryRunner.query(`
      CREATE INDEX idx_proposal_filter
      ON pb_proposal(active, is_private, deleted_at)
      WHERE deleted_at IS NULL
    `);
    await queryRunner.query(`
      CREATE INDEX idx_proposal_pct
      ON pb_proposal(penguin_category_tag_id)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_proposal_type
      ON pb_proposal(proposal_type)
    `);

    // pb_penguin_category_tag — filtri usati in search e tag lookup
    await queryRunner.query(`
      CREATE INDEX idx_pct_penguin
      ON pb_penguin_category_tag(penguin_id)
      WHERE deleted_at IS NULL
    `);
    await queryRunner.query(`
      CREATE INDEX idx_pct_filter
      ON pb_penguin_category_tag(active, deleted_at)
      WHERE deleted_at IS NULL
    `);

    // pb_referral — lookup per referrer
    await queryRunner.query(`
      CREATE INDEX idx_referral_referrer
      ON pb_referral(referrer_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_referral_referrer`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_pct_filter`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_pct_penguin`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_proposal_type`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_proposal_pct`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_proposal_filter`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_wallet_penguin_date`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_wallet_penguin`);
  }
}
