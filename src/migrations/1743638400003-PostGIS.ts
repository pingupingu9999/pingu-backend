import { MigrationInterface, QueryRunner } from 'typeorm';

export class PostGIS1743638400003 implements MigrationInterface {
  name = 'PostGIS1743638400003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable PostGIS extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);

    // Trigger function shared across all geo tables
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION sync_geo_location()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
          NEW.location = ST_SetSRID(
            ST_MakePoint(NEW.longitude::float8, NEW.latitude::float8),
            4326
          )::geography;
        ELSE
          NEW.location = NULL;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    // --- pb_proposal ---
    await queryRunner.query(`ALTER TABLE pb_proposal ADD COLUMN location GEOGRAPHY(Point, 4326)`);
    await queryRunner.query(`
      UPDATE pb_proposal
      SET location = ST_SetSRID(ST_MakePoint(longitude::float8, latitude::float8), 4326)::geography
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `);
    await queryRunner.query(`CREATE INDEX idx_proposal_geo ON pb_proposal USING GIST (location)`);
    await queryRunner.query(`
      CREATE TRIGGER trg_proposal_location
      BEFORE INSERT OR UPDATE OF latitude, longitude ON pb_proposal
      FOR EACH ROW EXECUTE FUNCTION sync_geo_location()
    `);

    // --- pb_penguin_category_tag ---
    await queryRunner.query(`ALTER TABLE pb_penguin_category_tag ADD COLUMN location GEOGRAPHY(Point, 4326)`);
    await queryRunner.query(`
      UPDATE pb_penguin_category_tag
      SET location = ST_SetSRID(ST_MakePoint(longitude::float8, latitude::float8), 4326)::geography
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `);
    await queryRunner.query(`CREATE INDEX idx_pct_geo ON pb_penguin_category_tag USING GIST (location)`);
    await queryRunner.query(`
      CREATE TRIGGER trg_pct_location
      BEFORE INSERT OR UPDATE OF latitude, longitude ON pb_penguin_category_tag
      FOR EACH ROW EXECUTE FUNCTION sync_geo_location()
    `);

    // --- pb_penguin ---
    await queryRunner.query(`ALTER TABLE pb_penguin ADD COLUMN location GEOGRAPHY(Point, 4326)`);
    await queryRunner.query(`
      UPDATE pb_penguin
      SET location = ST_SetSRID(ST_MakePoint(longitude::float8, latitude::float8), 4326)::geography
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `);
    await queryRunner.query(`CREATE INDEX idx_penguin_geo ON pb_penguin USING GIST (location)`);
    await queryRunner.query(`
      CREATE TRIGGER trg_penguin_location
      BEFORE INSERT OR UPDATE OF latitude, longitude ON pb_penguin
      FOR EACH ROW EXECUTE FUNCTION sync_geo_location()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_penguin_location ON pb_penguin`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_penguin_geo`);
    await queryRunner.query(`ALTER TABLE pb_penguin DROP COLUMN IF EXISTS location`);

    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_pct_location ON pb_penguin_category_tag`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_pct_geo`);
    await queryRunner.query(`ALTER TABLE pb_penguin_category_tag DROP COLUMN IF EXISTS location`);

    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_proposal_location ON pb_proposal`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_proposal_geo`);
    await queryRunner.query(`ALTER TABLE pb_proposal DROP COLUMN IF EXISTS location`);

    await queryRunner.query(`DROP FUNCTION IF EXISTS sync_geo_location`);
  }
}
