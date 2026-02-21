import { NotFoundException } from '@nestjs/common';

export class AttributeNotFound extends NotFoundException {
  constructor(customMessage?: string) {
    super({
      message: customMessage || 'Attribute not found',
      code: 'attribute_not_found',
    });
  }
}
