import { registerAs } from '@nestjs/config';

const databaseConfig = registerAs('database', () => ({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT
    ? Number(process.env.DATABASE_PORT)
    : undefined,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  syncronize: process.env.DATABASE_SYNCRONIZE === 'true',
  ssl_reject_unauthorized:
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true',
  enable_ssl_configuration:
    process.env.DATABASE_ENABLE_SSL_CONFIGURATION === 'true',
  migrations:
    process.env.DATABASE_RUN_SEEDS === 'true'
      ? [__dirname + '/migrations/**/*.ts', __dirname + '/seeds/**/*.ts']
      : [__dirname + '/migrations/**/*.ts'],
}));

export default databaseConfig;
