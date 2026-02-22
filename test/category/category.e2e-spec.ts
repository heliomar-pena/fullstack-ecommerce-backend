import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { UserFactory } from '../user/user.factory';
import { AuthHelper } from '../auth/auth.helper';
import { ConfigModule } from '@nestjs/config';
import { authConfig } from 'src/auth/auth.config';
import { UserModule } from 'src/user/user.module';
import { RoleIds } from 'src/role/enum/role.enum';
import { AttributeModule } from 'src/attribute/attribute.module';
import { AttributeFactory } from '../attribute/attribute.factory';
import { Attribute } from 'src/attribute/entities/attribute.entity';
import { CategoryFactory } from './category.factory';
import { CategoryModule } from 'src/category/category.module';
import { Category } from 'src/category/entities/category.entity';

describe('UserController (e2e)', () => {
  let app: INestApplication<App>;
  let userFactory: UserFactory;
  let authHelper: AuthHelper;
  let email: string;
  let password: string;
  let categoryFactory: CategoryFactory;
  let attributeFactory: AttributeFactory;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        UserModule,
        AttributeModule,
        CategoryModule,
        ConfigModule.forFeature(authConfig),
      ],
      providers: [UserFactory, AttributeFactory, CategoryFactory],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    userFactory = app.get(UserFactory);
    attributeFactory = app.get(AttributeFactory);
    categoryFactory = app.get(CategoryFactory);
    authHelper = new AuthHelper(app, userFactory);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('When user is logged in', () => {
    let accessToken: string;

    beforeEach(() => {
      email = 'dynamic-user@example.com';
      password = 'password123';
    });

    describe('And is at least Merchant', () => {
      beforeEach(async () => {
        accessToken = await authHelper
          .createAndLogin({ email, password }, [RoleIds.Merchant])
          .then((response) => response.accessToken);
      });

      describe('And creates a category', () => {
        let category: Category;
        describe('With empty attributes array', () => {
          let response: Response;
          beforeEach(async () => {
            category = categoryFactory.build({
              name: 'Test Category Empty Attributes',
            });
            response = await request(app.getHttpServer())
              .post('/category')
              .set(authHelper.authHeader(accessToken))
              .send(category);
          });

          it('POST: should return 201 for Merchant role', () => {
            expect(response.status).toBe(201);
          });

          describe('And name is already taken', () => {
            beforeEach(async () => {
              response = await request(app.getHttpServer())
                .post('/category')
                .set(authHelper.authHeader(accessToken))
                .send(category);
            });

            it('POST: should return 409 Conflict', () => {
              expect(response.status).toBe(409);
            });
          });
        });

        describe('With an attributes array', () => {
          let attributes: Attribute[];
          beforeEach(async () => {
            attributes = await attributeFactory.createMany(3);
            category = categoryFactory.build({
              attributes: attributes,
              name: 'Test Category With Attributes',
            });
          });

          describe('And attributes are valid', () => {
            it('POST: should return 201 Created', async () => {
              await request(app.getHttpServer())
                .post('/category')
                .set(authHelper.authHeader(accessToken))
                .send({
                  ...category,
                  attributes: category.attributes.map((attr) => attr.id),
                })
                .expect(201);
            });
          });

          describe('And at least one attribute is invalid', () => {
            it('POST: should return 400 Bad Request', async () => {
              await request(app.getHttpServer())
                .post('/category')
                .set(authHelper.authHeader(accessToken))
                .send({
                  ...category,
                  attributes: [
                    ...category.attributes.map((attr) => attr.id),
                    999,
                  ],
                })
                .expect(400);
            });
          });
        });
      });

      describe('And list existent categories', () => {
        describe('And there are not categories', () => {
          it('GET: should return 200 with empty list', async () => {
            const response = await request(app.getHttpServer())
              .get('/category')
              .set(authHelper.authHeader(accessToken))
              .expect(200);

            expect(response.body).toEqual([]);
          });
        });

        describe('And there are categories', () => {
          let categories: Category[];
          beforeEach(async () => {
            categories = await categoryFactory.createMany(3);
          });

          it('GET: should return 200 with list of categories', async () => {
            const response = await request(app.getHttpServer())
              .get('/category')
              .set(authHelper.authHeader(accessToken))
              .expect(200);

            expect(response.body).toHaveLength(3);
            expect(response.body).toStrictEqual(
              expect.arrayContaining(
                categories.map((category) =>
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                  expect.objectContaining({
                    id: category.id,
                    name: category.name,
                  }),
                ),
              ),
            );
          });
        });
      });
    });

    describe('And is Customer', () => {
      beforeEach(async () => {
        accessToken = await authHelper
          .createAndLogin({ email, password }, [RoleIds.Customer])
          .then((response) => response.accessToken);
      });

      it('GET: should return 200 for Customer role', async () => {
        await request(app.getHttpServer())
          .get('/category')
          .set(authHelper.authHeader(accessToken))
          .expect(200);
      });

      it('POST: should return 403 for Customer role', async () => {
        await request(app.getHttpServer())
          .post('/category')
          .set(authHelper.authHeader(accessToken))
          .send({
            name: 'Category',
            attributes: [1, 2, 3],
          })
          .expect(403);
      });
    });
  });
});
