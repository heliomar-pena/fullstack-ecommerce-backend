import { NotFoundException } from '@nestjs/common';

export class ProductNotFound extends NotFoundException {
  constructor() {
    super({ message: 'Product not found', code: 'product_not_found' });
  }
}
