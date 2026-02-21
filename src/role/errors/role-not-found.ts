import { NotFoundException } from '@nestjs/common';

export class RoleNotFound extends NotFoundException {
  constructor() {
    super({
      message: 'User not found.',
      code: 'role_not_found',
    });
  }
}
