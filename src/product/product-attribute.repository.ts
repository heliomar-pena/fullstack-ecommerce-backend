import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductAttribute } from './entities/product-attribute.entity';

@Injectable()
export class ProductAttributeRepository {
  constructor(
    @InjectRepository(ProductAttribute)
    private productAttributeRepository: Repository<ProductAttribute>,
  ) {}

  async getAllProductAttributes(productId: number) {
    return this.productAttributeRepository.find({
      where: { productId: productId },
      relations: {
        attribute: true,
      },
    });
  }

  async deleteAllProductAttributes(productId: number) {
    return this.productAttributeRepository.softDelete({ productId });
  }

  async upsertProductAttributes(productAttributes: ProductAttribute[]) {
    return this.productAttributeRepository.save(productAttributes);
  }
}
