import { ConfigType } from '@nestjs/config';
import databaseConfig from '../database.config.js';
import { DataSourceOptions } from 'typeorm/browser';

const generateDataSourceConfig = (
  configuration: ConfigType<typeof databaseConfig>,
): DataSourceOptions => ({
  type: 'postgres',
  host: configuration.host,
  port: configuration.port,
  username: configuration.username,
  password: configuration.password,
  database: configuration.database,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  synchronize: configuration.syncronize,
  migrations: configuration.migrations,
  migrationsTableName: 'migrations',
  ...(configuration.enable_ssl_configuration && {
    ssl: {
      rejectUnauthorized: configuration.ssl_reject_unauthorized,
    },
  }),
});

export default generateDataSourceConfig;
