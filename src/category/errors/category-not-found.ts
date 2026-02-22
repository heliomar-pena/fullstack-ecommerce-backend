import { NotFoundException } from '@nestjs/common';

export class CategoryNotFound extends NotFoundException {
  constructor() {
    super({ message: 'Category not found', code: 'category_not_found' });
  }
}
