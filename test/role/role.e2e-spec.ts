import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { UserFactory } from '../user/user.factory';
import { AuthHelper } from '../auth/auth.helper';
import { ConfigModule } from '@nestjs/config';
import { authConfig } from 'src/auth/auth.config';
import { UserModule } from 'src/user/user.module';
import { RoleIds } from 'src/role/enum/role.enum';

describe('RoleController (e2e)', () => {
  let app: INestApplication<App>;
  let userFactory: UserFactory;
  let authHelper: AuthHelper;

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

  describe('When user is logged in as admin', () => {
    let accessToken: string;

    beforeEach(async () => {
      accessToken = await authHelper
        .createAndLogin({ email: 'admin@example.com', password: 'admin123' }, [
          RoleIds.Admin,
        ])
        .then((response) => response.accessToken);
    });

    it('GET: /role/list should return all roles on our system', async () => {
      const response = await request(app.getHttpServer())
        .get('/role/list')
        .set(authHelper.authHeader(accessToken))
        .expect(200);

      expect(response.body).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: RoleIds.Admin }),
          expect.objectContaining({ id: RoleIds.Customer }),
          expect.objectContaining({ id: RoleIds.Merchant }),
        ]),
      );
    });
  });
});
