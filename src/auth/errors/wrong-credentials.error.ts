import { UnauthorizedException } from '@nestjs/common';

export class WrongCredentials extends UnauthorizedException {
  constructor() {
    super({
      message: 'Invalid username or password.',
      code: 'invalid_credentials',
    });
  }
}
