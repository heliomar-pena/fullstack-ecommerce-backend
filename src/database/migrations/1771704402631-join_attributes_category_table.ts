import { MigrationInterface, QueryRunner } from 'typeorm';

export class JoinAttributesCategoryTable1771704402631 implements MigrationInterface {
  name = 'JoinAttributesCategoryTable1771704402631';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "category_attributes_attribute" ("categoryId" integer NOT NULL, "attributeId" integer NOT NULL, CONSTRAINT "PK_6ab2df0c9bef35a162456ec6b01" PRIMARY KEY ("categoryId", "attributeId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_18f9759d3e6ab10366e9344efe" ON "category_attributes_attribute" ("categoryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d4ddd9f7211b25a6a6ed0e7d24" ON "category_attributes_attribute" ("attributeId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "category_attributes_attribute" ADD CONSTRAINT "FK_18f9759d3e6ab10366e9344efea" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_attributes_attribute" ADD CONSTRAINT "FK_d4ddd9f7211b25a6a6ed0e7d246" FOREIGN KEY ("attributeId") REFERENCES "attribute"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "category_attributes_attribute" DROP CONSTRAINT "FK_d4ddd9f7211b25a6a6ed0e7d246"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_attributes_attribute" DROP CONSTRAINT "FK_18f9759d3e6ab10366e9344efea"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d4ddd9f7211b25a6a6ed0e7d24"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_18f9759d3e6ab10366e9344efe"`,
    );
    await queryRunner.query(`DROP TABLE "category_attributes_attribute"`);
  }
}
