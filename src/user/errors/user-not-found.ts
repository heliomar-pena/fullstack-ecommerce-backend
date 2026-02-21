import { NotFoundException } from '@nestjs/common';

export class UserNotFound extends NotFoundException {
  constructor() {
    super({
      message: 'User not found.',
      code: 'user_not_found',
    });
  }
}
