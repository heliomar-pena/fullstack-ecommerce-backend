import { UnauthorizedException } from '@nestjs/common';

export class ExpiredToken extends UnauthorizedException {
  constructor() {
    super({
      message: 'Authentication Token expired.',
      code: 'auth_token_expired',
    });
  }
}
