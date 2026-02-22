import { BadRequestException } from '@nestjs/common';

export class ProductCategoryNotFound extends BadRequestException {
  constructor() {
    super({
      message: 'Category does not exists',
      code: 'product_category_not_found',
    });
  }
}
