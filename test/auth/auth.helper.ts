import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { OverrideCreateUserDto, UserFactory } from 'test/user/user.factory';

export class AuthHelper {
  constructor(
    private readonly app: INestApplication<App>,
    private readonly userFactory: UserFactory,
  ) {}

  async login(email: string, password = 'password123') {
    const response = (await request(this.app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password,
      })
      .expect(200)) as { body: { accessToken: string } };

    return {
      accessToken: response.body.accessToken,
    };
  }

  async createAndLogin(overrides: OverrideCreateUserDto, roles?: number[]) {
    const password = overrides.password || 'password123';

    const user = await this.userFactory.create(
      {
        ...overrides,
        password,
      },
      roles,
    );

    return this.login(user.email, password);
  }

  authHeader(accessToken: string) {
    return { Authorization: `Bearer ${accessToken}` };
  }
}
