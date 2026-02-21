import { ConflictException } from '@nestjs/common';

export class EmailInUse extends ConflictException {
  constructor() {
    super({
      message: 'User with provided email already exists.',
      code: 'user_email_in_use',
    });
  }
}
