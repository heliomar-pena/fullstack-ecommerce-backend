import { ForbiddenException } from '@nestjs/common';

export class InsufficientPermissions extends ForbiddenException {
  constructor() {
    super({
      message: 'Insufficient Permissions.',
      code: 'auth_insufficient_permissions',
    });
  }
}
