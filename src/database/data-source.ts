import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import databaseConfig from './database.config';
import generateDataSourceConfig from './utils/generate-data-source-config';

config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const dataSource = new DataSource(generateDataSourceConfig(databaseConfig()));

/**
 * DataSource instance with DB configuration
 * Used mostly for create migrations with typeorm CLI,
 * not used in the final application.
 */
export default dataSource;
