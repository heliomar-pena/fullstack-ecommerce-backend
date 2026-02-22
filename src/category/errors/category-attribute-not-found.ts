import { BadRequestException } from '@nestjs/common';

export class CategoryAttributeNotFound extends BadRequestException {
  constructor(customMessage?: string) {
    super({
      message: customMessage || 'Category attribute not found',
      code: 'category_attribute_not_found',
    });
  }
}
