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
import {
  Attribute,
  AttributeType,
} from 'src/attribute/entities/attribute.entity';
import { AttributeFactory } from './attribute.factory';
import { AttributeModule } from 'src/attribute/attribute.module';

describe('AttributeController (e2e)', () => {
  let app: INestApplication<App>;
  let userFactory: UserFactory;
  let attributeFactory: AttributeFactory;
  let authHelper: AuthHelper;
  let email: string;
  let password: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        UserModule,
        AttributeModule,
        ConfigModule.forFeature(authConfig),
      ],
      providers: [UserFactory, AttributeFactory],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    userFactory = app.get(UserFactory);
    attributeFactory = app.get(AttributeFactory);
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

      describe('When creating an attribute', () => {
        let response: Response;
        let attribute: Attribute;
        beforeEach(async () => {
          attribute = attributeFactory.build({
            name: 'Test Attribute',
          });
          response = await request(app.getHttpServer())
            .post('/attribute')
            .set(authHelper.authHeader(accessToken))
            .send(attribute);
        });

        it('POST: should return 201 for Merchant role', () => {
          expect(response.status).toBe(201);
        });

        describe('And attribute name already exists', () => {
          let response: Response;
          beforeEach(async () => {
            response = await request(app.getHttpServer())
              .post('/attribute')
              .set(authHelper.authHeader(accessToken))
              .send(attribute);
          });

          it('POST: should return 409 for duplicate attribute name', () => {
            expect(response.status).toBe(409);
          });
        });

        describe('When getting all attributes', () => {
          let getAllResponse: Response;
          beforeEach(async () => {
            getAllResponse = await request(app.getHttpServer())
              .get('/attribute')
              .set(authHelper.authHeader(accessToken));
          });

          it('GET: should return 200 for Merchant role', () => {
            expect(getAllResponse.status).toBe(200);
          });

          it('GET: should return an array of attributes', () => {
            expect(getAllResponse.body).toStrictEqual([
              expect.objectContaining({
                name: attribute.name,
                type: attribute.type,
              }),
            ]);
          });
        });
      });

      describe('When listing all attributes', () => {
        describe('And there are not attributes', () => {
          it('GET: should return 200 with empty array', async () => {
            const response = await request(app.getHttpServer())
              .get('/attribute')
              .set(authHelper.authHeader(accessToken));
            expect(response.status).toBe(200);
            expect(response.body).toStrictEqual([]);
          });
        });

        describe('And there are many attributes', () => {
          let attributes: Attribute[];
          beforeEach(async () => {
            attributes = await attributeFactory.createMany(6, {
              random_name_prefix: 'Test Attribute',
            });
          });

          it('GET: should return 200 with all attributes', async () => {
            const response = await request(app.getHttpServer())
              .get('/attribute')
              .set(authHelper.authHeader(accessToken));

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(attributes.length);

            expect(response.body).toEqual(
              expect.arrayContaining(
                attributes.map((attr) =>
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                  expect.objectContaining({ name: attr.name }),
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

      it('GET: should return 403 for Customer role', async () => {
        await request(app.getHttpServer())
          .get('/attribute')
          .set(authHelper.authHeader(accessToken))
          .expect(403);
      });

      it('POST: should return 403 for Customer role', async () => {
        await request(app.getHttpServer())
          .post('/attribute')
          .set(authHelper.authHeader(accessToken))
          .send({
            type: AttributeType.STRING,
            name: 'Test Attribute',
            description: 'Test Description',
          })
          .expect(403);
      });
    });
  });
});
