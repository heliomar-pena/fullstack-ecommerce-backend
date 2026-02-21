import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialRoles1771689090383 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO "role" (id, name) VALUES ($1, $2), ($3, $4), ($5, $6);',
      [1, 'Customer', 2, 'Merchant', 3, 'Admin'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "role" WHERE role.id IN (1, 2, 3)');
  }
}
