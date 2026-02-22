import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialUserAdmin1771689479485 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "user"(id, email, password) VALUES ($1, $2, $3);`,
      [
        1,
        'john.doe@acme.com',
        '$2b$10$WF33ts5YGuvR9ViNHmG1lO/O.zv/WXjpRBgRx/DXIJGMp5Gv79WTm',
      ],
    );
    await queryRunner.query(
      `
        INSERT INTO "user_roles"(
            "userId", "roleId")
            VALUES ($1, $2);
    `,
      [1, 3],
    );
    await queryRunner.query(`
      SELECT setval(
        pg_get_serial_sequence('"user"', 'id'),
        (SELECT MAX(id) FROM "user")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DELETE FROM "user_roles" WHERE user_roles.userId = 1;',
    );
    await queryRunner.query('DELETE FROM "user" WHERE user.id = 1;');
  }
}
