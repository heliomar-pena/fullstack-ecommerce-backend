import { ConflictException } from '@nestjs/common';

export class CategoryAlreadyExists extends ConflictException {
  constructor() {
    super({
      message: 'Category already exists',
      code: 'category_already_exists',
    });
  }
}
