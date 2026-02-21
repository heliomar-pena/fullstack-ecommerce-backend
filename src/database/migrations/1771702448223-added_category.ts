import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedCategory1771702448223 implements MigrationInterface {
  name = 'AddedCategory1771702448223';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."attribute_type_enum" AS ENUM('string', 'number', 'boolean')`,
    );
    await queryRunner.query(
      `CREATE TABLE "attribute" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "type" "public"."attribute_type_enum" NOT NULL, "unit" character varying, CONSTRAINT "UQ_350fb4f7eb87e4c7d35c97a9828" UNIQUE ("name"), CONSTRAINT "PK_b13fb7c5c9e9dff62b60e0de729" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "category" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_23c05c292c439d77b0de816b500" UNIQUE ("name"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TABLE "attribute"`);
    await queryRunner.query(`DROP TYPE "public"."attribute_type_enum"`);
  }
}
