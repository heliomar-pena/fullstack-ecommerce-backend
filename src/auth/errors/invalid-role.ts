import { InternalServerErrorException } from '@nestjs/common';

export class InvalidRole extends InternalServerErrorException {
  constructor() {
    super({
      message: 'Invalid Customer Role',
      code: 'auth_invalid_customer_role',
    });
  }
}
