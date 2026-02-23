import { MigrationInterface, QueryRunner } from 'typeorm';
import bcrypt from 'bcrypt';
import { authConfig } from 'src/auth/auth.config';

export class InitialUserAdmin1771689479485 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const config = authConfig();
    const email = process.env.ADMIN_DEFAULT_EMAIL ?? 'john.doe@acme.com';
    const password = bcrypt.hashSync(
      process.env.ADMIN_DEFAULT_PASSWORD ?? 'admin123',
      config.salt,
    );

    await queryRunner.query(
      `INSERT INTO "user"(id, email, password) VALUES ($1, $2, $3);`,
      [1, email, password],
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
