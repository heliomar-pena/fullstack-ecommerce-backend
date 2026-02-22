import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { UserFactory } from '../user/user.factory';
import { ConfigModule } from '@nestjs/config';
import { authConfig } from 'src/auth/auth.config';
import { UserModule } from 'src/user/user.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let userFactory: UserFactory;
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('When user tries to log in', () => {
    beforeEach(() => {
      email = 'auth@example.com';
      password = 'password123';
    });

    describe('And user exists valid', () => {
      beforeEach(async () => {
        await userFactory.create({
          email,
          password,
        });
      });

      describe('And password match', () => {
        it('GET: /auth/login should return a valid access token', async () => {
          const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
              email,
              password,
            });

          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('accessToken');
        });
      });

      describe('And password is incorrect', () => {
        it('GET: /auth/login should return a 401 error', async () => {
          const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
              email,
              password: 'wrongpassword',
            });

          expect(response.status).toBe(401);
        });
      });
    });

    describe('And credentials are invalid', () => {
      it('GET: /auth/login should return a 401 error', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email,
            password,
          });

        expect(response.status).toBe(401);
      });
    });
  });

  describe('When a new user sign up', () => {
    let response: Response;
    beforeEach(async () => {
      response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password,
        })
        .expect(201);
    });

    it('GET: /auth/register should return 201 CREATED', () => {
      expect(response.status).toBe(201);
    });

    describe('And the email is already in use', () => {
      it('GET: /auth/register should return 409 CONFLICT', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email,
            password,
          })
          .expect(409);
      });
    });
  });
});
