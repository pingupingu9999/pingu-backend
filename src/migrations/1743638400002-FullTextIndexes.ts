import { MigrationInterface, QueryRunner } from 'typeorm';

export class FullTextIndexes1743638400002 implements MigrationInterface {
  name = 'FullTextIndexes1743638400002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // GIN index for full-text search on pb_proposal (name + description)
    await queryRunner.query(`
      CREATE INDEX idx_proposal_fts
      ON pb_proposal
      USING GIN (
        to_tsvector('italian', coalesce(name, '') || ' ' || coalesce(description, ''))
      )
    `);

    // GIN index for full-text search on pb_penguin_category_tag (custom_name + description)
    await queryRunner.query(`
      CREATE INDEX idx_pct_fts
      ON pb_penguin_category_tag
      USING GIN (
        to_tsvector('italian', coalesce(custom_name, '') || ' ' || coalesce(description, ''))
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_proposal_fts`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_pct_fts`);
  }
}
