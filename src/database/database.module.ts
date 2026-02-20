import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './database.config';
import generateDataSourceConfig from './utils/generate-data-source-config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      useFactory: generateDataSourceConfig,
      inject: [databaseConfig.KEY],
    }),
  ],
})
export class DatabaseModule {}
