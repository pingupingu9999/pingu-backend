import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1743638400000 implements MigrationInterface {
  name = 'InitialSchema1743638400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- ENUMS ---
    await queryRunner.query(`CREATE TYPE "sex_enum" AS ENUM('MALE','FEMALE','NOT_SPECIFIED','OTHER')`);
    await queryRunner.query(`CREATE TYPE "income_type_enum" AS ENUM('PING_RECEIVED','PING_SENT','EVENT_JOIN','EXCHANGE','REFERRAL','SIGNUP_BONUS','TAG_PURCHASE','SPONSORSHIP','BUNDLE_PURCHASE')`);
    await queryRunner.query(`CREATE TYPE "proposal_type_enum" AS ENUM('SERVICE','EVENT','EXCHANGE','REQUEST')`);
    await queryRunner.query(`CREATE TYPE "ping_status_enum" AS ENUM('PENDING','ACCEPTED','REJECTED','IN_PROGRESS','PINGER_CONFIRMED','PINGED_CONFIRMED','COMPLETED','CANCELLED','EXPIRED','DISPUTED')`);

    // --- pb_authority ---
    await queryRunner.query(`
      CREATE TABLE "pb_authority" (
        "name" VARCHAR(50) NOT NULL,
        CONSTRAINT "pk_authority" PRIMARY KEY ("name")
      )
    `);

    // --- pb_user ---
    await queryRunner.query(`
      CREATE TABLE "pb_user" (
        "id"                 BIGSERIAL PRIMARY KEY,
        "login"              VARCHAR(50)  NOT NULL UNIQUE,
        "password"           VARCHAR(100),
        "first_name"         VARCHAR(50),
        "last_name"          VARCHAR(50),
        "email"              VARCHAR(100) UNIQUE,
        "tax_code"           VARCHAR(256),
        "vat_number"         VARCHAR(256),
        "phone"              VARCHAR(10),
        "sex"                sex_enum,
        "birthday"           TIMESTAMP,
        "activated"          BOOLEAN DEFAULT FALSE,
        "lang_key"           VARCHAR(10),
        "image_url"          VARCHAR(256),
        "activation_key"     VARCHAR(20),
        "reset_key"          VARCHAR(20),
        "reset_date"         TIMESTAMP,
        "created_by"         VARCHAR(50)  NOT NULL,
        "created_date"       TIMESTAMP    NOT NULL DEFAULT NOW(),
        "last_modified_by"   VARCHAR(50),
        "last_modified_date" TIMESTAMP
      )
    `);

    // --- pb_user_authority ---
    await queryRunner.query(`
      CREATE TABLE "pb_user_authority" (
        "user_id"        BIGINT       NOT NULL REFERENCES "pb_user"("id") ON DELETE CASCADE,
        "authority_name" VARCHAR(50)  NOT NULL REFERENCES "pb_authority"("name") ON DELETE CASCADE,
        CONSTRAINT "pk_user_authority" PRIMARY KEY ("user_id", "authority_name")
      )
    `);

    // --- pb_penguin ---
    await queryRunner.query(`
      CREATE TABLE "pb_penguin" (
        "id"                 BIGSERIAL PRIMARY KEY,
        "user_id"            BIGINT       NOT NULL UNIQUE REFERENCES "pb_user"("id") ON DELETE CASCADE,
        "bio"                VARCHAR(500),
        "description"        VARCHAR(2000),
        "note"               VARCHAR(1000),
        "radius"             INTEGER,
        "latitude"           NUMERIC(10,7),
        "longitude"          NUMERIC(10,7),
        "deleted_at"         TIMESTAMP,
        "created_by"         VARCHAR(50)  NOT NULL,
        "created_date"       TIMESTAMP    NOT NULL DEFAULT NOW(),
        "last_modified_by"   VARCHAR(50),
        "last_modified_date" TIMESTAMP
      )
    `);

    // --- pb_penguin_meta ---
    await queryRunner.query(`
      CREATE TABLE "pb_penguin_meta" (
        "id"                 BIGSERIAL PRIMARY KEY,
        "penguin_id"         BIGINT       NOT NULL REFERENCES "pb_penguin"("id") ON DELETE CASCADE,
        "meta_key"           VARCHAR(100) NOT NULL,
        "meta_value"         VARCHAR(1000),
        "created_by"         VARCHAR(50)  NOT NULL,
        "created_date"       TIMESTAMP    NOT NULL DEFAULT NOW(),
        "last_modified_by"   VARCHAR(50),
        "last_modified_date" TIMESTAMP
      )
    `);

    // --- pb_penguin_setting ---
    await queryRunner.query(`
      CREATE TABLE "pb_penguin_setting" (
        "id"                 BIGSERIAL PRIMARY KEY,
        "penguin_id"         BIGINT       NOT NULL REFERENCES "pb_penguin"("id") ON DELETE CASCADE,
        "setting_key"        VARCHAR(100) NOT NULL,
        "setting_value"      VARCHAR(500),
        "created_by"         VARCHAR(50)  NOT NULL,
        "created_date"       TIMESTAMP    NOT NULL DEFAULT NOW(),
        "last_modified_by"   VARCHAR(50),
        "last_modified_date" TIMESTAMP
      )
    `);

    // --- pb_category ---
    await queryRunner.query(`
      CREATE TABLE "pb_category" (
        "id"                 BIGSERIAL PRIMARY KEY,
        "name"               VARCHAR(100) NOT NULL UNIQUE,
        "description"        VARCHAR(500),
        "emoji"              VARCHAR(10),
        "active"             BOOLEAN      NOT NULL DEFAULT TRUE,
        "created_by"         VARCHAR(50)  NOT NULL,
        "created_date"       TIMESTAMP    NOT NULL DEFAULT NOW(),
        "last_modified_by"   VARCHAR(50),
        "last_modified_date" TIMESTAMP
      )
    `);

    // --- pb_category_tag ---
    await queryRunner.query(`
      CREATE TABLE "pb_category_tag" (
        "id"                 BIGSERIAL PRIMARY KEY,
        "category_id"        BIGINT       NOT NULL REFERENCES "pb_category"("id") ON DELETE CASCADE,
        "name"               VARCHAR(100) NOT NULL,
        "description"        VARCHAR(500),
        "emoji"              VARCHAR(10),
        "active"             BOOLEAN      NOT NULL DEFAULT TRUE,
        "created_by"         VARCHAR(50)  NOT NULL,
        "created_date"       TIMESTAMP    NOT NULL DEFAULT NOW(),
        "last_modified_by"   VARCHAR(50),
        "last_modified_date" TIMESTAMP
      )
    `);

    // --- pb_penguin_category_tag ---
    await queryRunner.query(`
      CREATE TABLE "pb_penguin_category_tag" (
        "id"                BIGSERIAL PRIMARY KEY,
        "penguin_id"        BIGINT        NOT NULL REFERENCES "pb_penguin"("id") ON DELETE CASCADE,
        "category_tag_id"   BIGINT        NOT NULL REFERENCES "pb_category_tag"("id"),
        "custom_name"       VARCHAR(100)  NOT NULL,
        "description"       VARCHAR(1000),
        "radius"            INTEGER,
        "latitude"          NUMERIC(10,7),
        "longitude"         NUMERIC(10,7),
        "active"            BOOLEAN       NOT NULL DEFAULT TRUE,
        "deleted_at"        TIMESTAMP,
        "created_by"        VARCHAR(50)   NOT NULL,
        "created_date"      TIMESTAMP     NOT NULL DEFAULT NOW(),
        "last_modified_by"  VARCHAR(50),
        "last_modified_date" TIMESTAMP
      )
    `);

    // --- pb_proposal ---
    await queryRunner.query(`
      CREATE TABLE "pb_proposal" (
        "id"                        BIGSERIAL PRIMARY KEY,
        "penguin_category_tag_id"   BIGINT             NOT NULL REFERENCES "pb_penguin_category_tag"("id") ON DELETE CASCADE,
        "name"                      VARCHAR(200)       NOT NULL,
        "description"               VARCHAR(3000),
        "proposal_type"             proposal_type_enum NOT NULL,
        "guests"                    INTEGER,
        "radius"                    INTEGER,
        "latitude"                  NUMERIC(10,7),
        "longitude"                 NUMERIC(10,7),
        "start_date"                TIMESTAMP,
        "end_date"                  TIMESTAMP,
        "is_private"                BOOLEAN            NOT NULL DEFAULT FALSE,
        "acceptance"                BOOLEAN            NOT NULL DEFAULT FALSE,
        "active"                    BOOLEAN            NOT NULL DEFAULT TRUE,
        "deleted_at"                TIMESTAMP,
        "created_by"                VARCHAR(50)        NOT NULL,
        "created_date"              TIMESTAMP          NOT NULL DEFAULT NOW(),
        "last_modified_by"          VARCHAR(50),
        "last_modified_date"        TIMESTAMP
      )
    `);

    // --- pb_proposal_attachment ---
    await queryRunner.query(`
      CREATE TABLE "pb_proposal_attachment" (
        "id"                 BIGSERIAL PRIMARY KEY,
        "proposal_id"        BIGINT       NOT NULL REFERENCES "pb_proposal"("id") ON DELETE CASCADE,
        "image_url"          VARCHAR(512),
        "file_name"          VARCHAR(255),
        "mime_type"          VARCHAR(100),
        "created_by"         VARCHAR(50)  NOT NULL,
        "created_date"       TIMESTAMP    NOT NULL DEFAULT NOW(),
        "last_modified_by"   VARCHAR(50),
        "last_modified_date" TIMESTAMP
      )
    `);

    // --- pb_interaction ---
    await queryRunner.query(`
      CREATE TABLE "pb_interaction" (
        "id"                 BIGSERIAL PRIMARY KEY,
        "name"               VARCHAR(100) NOT NULL,
        "description"        VARCHAR(500),
        "emoji"              VARCHAR(10),
        "active"             BOOLEAN      NOT NULL DEFAULT TRUE,
        "created_by"         VARCHAR(50)  NOT NULL,
        "created_date"       TIMESTAMP    NOT NULL DEFAULT NOW(),
        "last_modified_by"   VARCHAR(50),
        "last_modified_date" TIMESTAMP
      )
    `);

    // --- pb_proposal_interaction ---
    await queryRunner.query(`
      CREATE TABLE "pb_proposal_interaction" (
        "id"                 BIGSERIAL PRIMARY KEY,
        "penguin_id"         BIGINT      NOT NULL REFERENCES "pb_penguin"("id") ON DELETE CASCADE,
        "proposal_id"        BIGINT      NOT NULL REFERENCES "pb_proposal"("id") ON DELETE CASCADE,
        "interaction_id"     BIGINT      NOT NULL REFERENCES "pb_interaction"("id"),
        "emoji"              VARCHAR(10),
        "created_by"         VARCHAR(50) NOT NULL,
        "created_date"       TIMESTAMP   NOT NULL DEFAULT NOW(),
        "last_modified_by"   VARCHAR(50),
        "last_modified_date" TIMESTAMP
      )
    `);

    // --- pb_coin_bundle ---
    await queryRunner.query(`
      CREATE TABLE "pb_coin_bundle" (
        "id"                 BIGSERIAL PRIMARY KEY,
        "name"               VARCHAR(100)     NOT NULL,
        "description"        VARCHAR(500),
        "price"              NUMERIC(10,2)    NOT NULL,
        "quantity"           INTEGER          NOT NULL,
        "discount"           NUMERIC(5,2)     NOT NULL DEFAULT 0,
        "active"             BOOLEAN          NOT NULL DEFAULT TRUE,
        "created_by"         VARCHAR(50)      NOT NULL,
        "created_date"       TIMESTAMP        NOT NULL DEFAULT NOW(),
        "last_modified_by"   VARCHAR(50),
        "last_modified_date" TIMESTAMP
      )
    `);

    // --- pb_penguin_wallet ---
    await queryRunner.query(`
      CREATE TABLE "pb_penguin_wallet" (
        "id"                 BIGSERIAL PRIMARY KEY,
        "penguin_id"         BIGINT             NOT NULL REFERENCES "pb_penguin"("id") ON DELETE CASCADE,
        "income_type"        income_type_enum   NOT NULL,
        "quantity"           NUMERIC(12,2)      NOT NULL,
        "description"        VARCHAR(500),
        "coin_bundle_id"     BIGINT             REFERENCES "pb_coin_bundle"("id"),
        "proposal_id"        BIGINT,
        "ping_id"            BIGINT,
        "created_by"         VARCHAR(50)        NOT NULL,
        "created_date"       TIMESTAMP          NOT NULL DEFAULT NOW(),
        "last_modified_by"   VARCHAR(50),
        "last_modified_date" TIMESTAMP
      )
    `);

    // --- pb_ping ---
    await queryRunner.query(`
      CREATE TABLE "pb_ping" (
        "id"                 BIGSERIAL PRIMARY KEY,
        "pinger_id"          BIGINT           NOT NULL REFERENCES "pb_penguin"("id"),
        "pinged_id"          BIGINT           NOT NULL REFERENCES "pb_penguin"("id"),
        "proposal_id"        BIGINT           NOT NULL REFERENCES "pb_proposal"("id"),
        "status"             ping_status_enum NOT NULL DEFAULT 'PENDING',
        "pinger_confirmed"   BOOLEAN          NOT NULL DEFAULT FALSE,
        "pinged_confirmed"   BOOLEAN          NOT NULL DEFAULT FALSE,
        "pc_released"        BOOLEAN          NOT NULL DEFAULT FALSE,
        "completed_date"     TIMESTAMP,
        "message"            VARCHAR(1000),
        "created_by"         VARCHAR(50)      NOT NULL,
        "created_date"       TIMESTAMP        NOT NULL DEFAULT NOW(),
        "last_modified_by"   VARCHAR(50),
        "last_modified_date" TIMESTAMP
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_ping_pinger" ON "pb_ping"("pinger_id")`);
    await queryRunner.query(`CREATE INDEX "idx_ping_pinged" ON "pb_ping"("pinged_id")`);
    await queryRunner.query(`CREATE INDEX "idx_ping_status" ON "pb_ping"("status")`);

    // --- pb_daily_limit ---
    await queryRunner.query(`
      CREATE TABLE "pb_daily_limit" (
        "id"          BIGSERIAL PRIMARY KEY,
        "penguin_id"  BIGINT  NOT NULL REFERENCES "pb_penguin"("id") ON DELETE CASCADE,
        "limit_date"  DATE    NOT NULL DEFAULT CURRENT_DATE,
        "pings_sent"  INTEGER NOT NULL DEFAULT 0,
        "pc_earned"   INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT "uq_daily_limit" UNIQUE ("penguin_id","limit_date")
      )
    `);

    // --- pb_referral ---
    await queryRunner.query(`
      CREATE TABLE "pb_referral" (
        "id"                 BIGSERIAL PRIMARY KEY,
        "referrer_id"        BIGINT      NOT NULL REFERENCES "pb_penguin"("id"),
        "referred_id"        BIGINT      NOT NULL REFERENCES "pb_penguin"("id"),
        "referral_code"      VARCHAR(20) NOT NULL UNIQUE,
        "status"             VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        "rewarded"           BOOLEAN     NOT NULL DEFAULT FALSE,
        "created_by"         VARCHAR(50) NOT NULL,
        "created_date"       TIMESTAMP   NOT NULL DEFAULT NOW(),
        "last_modified_by"   VARCHAR(50),
        "last_modified_date" TIMESTAMP,
        CONSTRAINT "uq_referral_pair" UNIQUE ("referrer_id","referred_id")
      )
    `);

    // --- pb_notification ---
    await queryRunner.query(`
      CREATE TABLE "pb_notification" (
        "id"          BIGSERIAL PRIMARY KEY,
        "penguin_id"  BIGINT       NOT NULL REFERENCES "pb_penguin"("id") ON DELETE CASCADE,
        "type"        VARCHAR(50)  NOT NULL,
        "title"       VARCHAR(200) NOT NULL,
        "body"        VARCHAR(1000),
        "data"        JSONB,
        "is_read"     BOOLEAN      NOT NULL DEFAULT FALSE,
        "created_by"  VARCHAR(50)  NOT NULL,
        "created_date" TIMESTAMP   NOT NULL DEFAULT NOW(),
        "last_modified_by"   VARCHAR(50),
        "last_modified_date" TIMESTAMP
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_notification_penguin" ON "pb_notification"("penguin_id")`);
    await queryRunner.query(`CREATE INDEX "idx_notification_read" ON "pb_notification"("penguin_id","is_read")`);

    // --- pb_sponsorship ---
    await queryRunner.query(`
      CREATE TABLE "pb_sponsorship" (
        "id"                      BIGSERIAL PRIMARY KEY,
        "penguin_category_tag_id" BIGINT      REFERENCES "pb_penguin_category_tag"("id"),
        "proposal_id"             BIGINT      REFERENCES "pb_proposal"("id"),
        "cost_pc"                 INTEGER     NOT NULL,
        "start_date"              TIMESTAMP   NOT NULL,
        "end_date"                TIMESTAMP   NOT NULL,
        "is_active"               BOOLEAN     NOT NULL DEFAULT TRUE,
        "impressions"             INTEGER     NOT NULL DEFAULT 0,
        "clicks"                  INTEGER     NOT NULL DEFAULT 0,
        "created_by"              VARCHAR(50) NOT NULL,
        "created_date"            TIMESTAMP   NOT NULL DEFAULT NOW(),
        "last_modified_by"        VARCHAR(50),
        "last_modified_date"      TIMESTAMP
      )
    `);

    // --- pb_report ---
    await queryRunner.query(`
      CREATE TABLE "pb_report" (
        "id"                 BIGSERIAL PRIMARY KEY,
        "reporter_id"        BIGINT       NOT NULL REFERENCES "pb_penguin"("id"),
        "reported_id"        BIGINT       NOT NULL REFERENCES "pb_penguin"("id"),
        "ping_id"            BIGINT       REFERENCES "pb_ping"("id"),
        "reason"             VARCHAR(50)  NOT NULL,
        "description"        VARCHAR(1000),
        "status"             VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
        "created_by"         VARCHAR(50)  NOT NULL,
        "created_date"       TIMESTAMP    NOT NULL DEFAULT NOW(),
        "last_modified_by"   VARCHAR(50),
        "last_modified_date" TIMESTAMP
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_report" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_sponsorship" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_notification" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_referral" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_daily_limit" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_ping" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_penguin_wallet" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_coin_bundle" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_proposal_interaction" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_interaction" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_proposal_attachment" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_proposal" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_penguin_category_tag" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_category_tag" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_category" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_penguin_setting" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_penguin_meta" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_penguin" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_user_authority" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_user" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pb_authority" CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ping_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "proposal_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "income_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "sex_enum"`);
  }
}
