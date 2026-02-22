import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/crate-product.dto';
import { Product } from './entities/product.entity';
import { Category } from 'src/category/entities/category.entity';
import { ProductAttribute } from './entities/product-attribute.entity';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(ProductAttribute)
    private productAttributeRepository: Repository<ProductAttribute>,
  ) {}

  async create(data: CreateProductDto, category: Category, merchantId: number) {
    const product = this.productRepository.create({
      ...data,
      category,
      merchantId,
    });

    return this.productRepository.save(product);
  }

  async findAll() {
    return this.productRepository.find({
      relations: {
        category: { attributes: true },
        attributes: true,
      },
    });
  }

  async findOne(productId: number) {
    return this.productRepository.findOne({
      where: {
        id: productId,
      },
    });
  }

  async deleteProduct(productId: number, merchantId: number) {
    const result = await this.productRepository.softDelete({
      id: productId,
      merchantId,
    });

    return result.affected;
  }

  async updateMerchantProduct(
    productId: number,
    merchantId: number,
    data: Partial<Product>,
  ) {
    const result = await this.productRepository.update(
      { id: productId, merchantId },
      data,
    );

    return result.affected;
  }

  async getAllProductAttributes(productId: number) {
    return this.productAttributeRepository.find({
      where: { productId: productId },
      relations: {
        attribute: true,
      },
    });
  }

  async upsertProductAttributes(productAttributes: ProductAttribute[]) {
    return this.productAttributeRepository.save(productAttributes);
  }
}
