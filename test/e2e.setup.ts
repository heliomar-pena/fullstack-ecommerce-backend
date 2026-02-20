import dataSource from 'src/database/data-source';

beforeEach(async () => {
  await dataSource.initialize();

  await dataSource.runMigrations();
  await dataSource.destroy();
});

afterEach(async () => {
  await dataSource.initialize();

  await dataSource.dropDatabase();
  await dataSource.destroy();
});
