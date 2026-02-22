import { Injectable } from '@nestjs/common';
import { Product } from 'src/product/entities/product.entity';
import { ProductRepository } from 'src/product/product.repository';
import { User } from 'src/user/entities/user.entity';
import { Category } from 'src/category/entities/category.entity';
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from 'src/product/dto/crate-product.dto';

export class OverrideCreateProductDto extends PartialType(CreateProductDto) {
  isActive?: Product['isActive'];
}

@Injectable()
export class ProductFactory {
  constructor(private readonly productRepository: ProductRepository) {}

  private random(prefix = 'product') {
    return `${prefix}_${Math.floor(Math.random() * 1_000_000)}`;
  }

  private defaults(): Omit<CreateProductDto, 'categoryId'> {
    return {
      title: this.random('title'),
      description: `description_${this.random()}`,
      code: this.random('code'),
    };
  }

  build(
    category: Category,
    merchant: User,
    override: OverrideCreateProductDto = {},
  ): Product {
    const product = new Product();

    const defaults = this.defaults();

    product.category = category;
    product.categoryId = category.id;
    product.merchant = merchant;
    product.merchantId = merchant.id;
    product.isActive = override.isActive ?? true;
    product.title = override.title ?? defaults.title;
    product.description = override.description ?? defaults.description;
    product.code = override.code ?? defaults.code;

    return product;
  }

  async create(params: {
    merchant: User;
    category: Category;
    override?: OverrideCreateProductDto;
  }): Promise<Product> {
    const { merchant, category, override } = params;

    const product = this.build(category, merchant, override);

    return this.productRepository.create(
      product,
      product.category,
      product.merchantId,
    );
  }

  async createMany(
    count: number,
    params: {
      merchant: User;
      category: Category;
      override?: OverrideCreateProductDto;
    },
  ): Promise<Product[]> {
    const products: Product[] = [];

    for (let i = 0; i < count; i++) {
      products.push(await this.create(params));
    }

    return products;
  }
}
