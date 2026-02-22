import { BadRequestException } from '@nestjs/common';
import { Attribute } from 'src/attribute/entities/attribute.entity';
import { ProductAttributesDto } from '../dto/product-attributes.dto';

export class ProductInvalidAttributes extends BadRequestException {
  constructor(
    categoryAttributes: Attribute[] = [],
    providedAttributes: ProductAttributesDto,
  ) {
    const categoryAttributesMap = categoryAttributes.map(
      (category) => `${category.name}: ${category.type}`,
    );

    const providedAttributesMap = Object.keys(providedAttributes).map(
      (key) => `${key}: ${typeof providedAttributes[key]}`,
    );

    super(
      `Invalid attributes. Expected: [${categoryAttributesMap.join(', ')}], Got: [${providedAttributesMap.join(', ')}]`,
    );
  }
}
