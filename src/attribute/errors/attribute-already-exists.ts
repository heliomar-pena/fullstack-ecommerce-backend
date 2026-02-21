import { ConflictException } from '@nestjs/common';

export class AttributeAlreadyExists extends ConflictException {
  constructor() {
    super({
      message: 'Attribute already exists',
      code: 'attribute_already_exists',
    });
  }
}
