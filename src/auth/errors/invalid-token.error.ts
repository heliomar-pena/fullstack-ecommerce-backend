import { UnauthorizedException } from '@nestjs/common';

export class InvalidToken extends UnauthorizedException {
  constructor() {
    super({
      message: 'Authentication Token invalid.',
      code: 'auth_token_invalid',
    });
  }
}
