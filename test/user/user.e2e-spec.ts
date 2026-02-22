import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { UserFactory } from './user.factory';
import { AuthHelper } from '../auth/auth.helper';
import { ConfigModule } from '@nestjs/config';
import { authConfig } from 'src/auth/auth.config';
import { UserModule } from 'src/user/user.module';
import { RoleIds } from 'src/role/enum/role.enum';
import { User } from 'src/user/entities/user.entity';

describe('UserController (e2e)', () => {
  let app: INestApplication<App>;
  let userFactory: UserFactory;
  let authHelper: AuthHelper;
  let email: string;
  let password: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UserModule, ConfigModule.forFeature(authConfig)],
      providers: [UserFactory],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    userFactory = app.get(UserFactory);
    authHelper = new AuthHelper(app, userFactory);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('When user is not logged in', () => {
    describe('And tries to access protected routes', () => {
      it('GET: /user/profile should return 403 Forbidden', async () => {
        await request(app.getHttpServer()).get('/user/profile').expect(403);
      });
    });
  });

  describe('When user logged in as merchant', () => {
    let accessToken: string;
    beforeEach(async () => {
      email = 'merchant@example.com';
      password = 'password123';
      accessToken = await authHelper
        .createAndLogin({ email, password }, [RoleIds.Merchant])
        .then((response) => response.accessToken);
    });

    it('GET: /user/profile should return 200 OK', async () => {
      const response = (await request(app.getHttpServer())
        .get('/user/profile')
        .set(authHelper.authHeader(accessToken))
        .expect(200)) as { body: { email: string } };

      expect(response.body).toBeDefined();
      expect(response.body.email).toBe(email);
    });

    describe('And tries to assign a role to a user', () => {
      it('POST: /:id/roles/:roleId should return 403 Forbidden if user is not admin', async () => {
        const customerUser = await userFactory.create({
          email: 'customer@example.com',
          password: 'password123',
        });
        await request(app.getHttpServer())
          .post(`/user/${customerUser.id}/roles/${RoleIds.Merchant}`)
          .set(authHelper.authHeader(accessToken))
          .expect(403);
      });
    });
  });

  describe('When user is admin', () => {
    let accessToken: string;
    beforeEach(async () => {
      email = 'merchant@example.com';
      password = 'password123';
      accessToken = await authHelper
        .createAndLogin({ email, password }, [RoleIds.Merchant, RoleIds.Admin])
        .then((response) => response.accessToken);
    });

    describe('And tries to assign a role to a user', () => {
      describe('And user exists', () => {
        let customerUser: User;

        beforeEach(async () => {
          customerUser = await userFactory.create({
            email: 'customer@example.com',
            password: 'password123',
          });
        });

        it('POST: /:id/roles/:roleId should return 201 Created', async () => {
          await request(app.getHttpServer())
            .post(`/user/${customerUser.id}/roles/${RoleIds.Merchant}`)
            .set(authHelper.authHeader(accessToken))
            .expect(201);
        });

        describe('And role does not exist', () => {
          it('POST: /:id/roles/:roleId should return 400 Bad Request', async () => {
            await request(app.getHttpServer())
              .post(`/user/${customerUser.id}/roles/999999`)
              .set(authHelper.authHeader(accessToken))
              .expect(400);
          });
        });
      });

      describe('And user does not exists', () => {
        it('POST: /:id/roles/:roleId should return 404 Not Found', async () => {
          await request(app.getHttpServer())
            .post(`/user/999999/roles/${RoleIds.Merchant}`)
            .set(authHelper.authHeader(accessToken))
            .expect(404);
        });
      });
    });
  });
});
