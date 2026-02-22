import { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteProductAttribute1771722278755 implements MigrationInterface {
  name = 'SoftDeleteProductAttribute1771722278755';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_attribute" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_attribute" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_attribute" ADD "deletedAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_attribute" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_attribute" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_attribute" DROP COLUMN "createdAt"`,
    );
  }
}
