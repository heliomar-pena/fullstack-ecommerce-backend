import { BadRequestException } from '@nestjs/common';

export class InvalidRole extends BadRequestException {
  constructor() {
    super({
      message: 'Invalid Customer Role',
      code: 'auth_invalid_customer_role',
    });
  }
}
