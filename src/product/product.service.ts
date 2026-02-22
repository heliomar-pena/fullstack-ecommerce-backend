import {
  // ConflictException,
  Injectable,
  // NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/crate-product.dto';
// import { Product } from './entities/product.entity';
// import { validate } from 'class-validator';
import { ProductRepository } from './product.repository';
import { ProductNotFound } from './errors/product-not-found';
import { CategoryRepository } from 'src/category/category.repository';
import { CategoryNotFound } from 'src/category/errors/category-not-found';
import { ProductAttributesDto } from './dto/product-attributes.dto';
import {
  Attribute,
  AttributeType,
} from 'src/attribute/entities/attribute.entity';
import { ProductInvalidAttributes } from './errors/product-invalid-attributes';
import { ProductAttribute } from './entities/product-attribute.entity';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async getProduct(productId: number) {
    const product = await this.productRepository.findOne(productId);

    if (!product) throw new ProductNotFound();

    return product;
  }

  async getAllProducts() {
    return this.productRepository.findAll();
  }

  async createProduct(data: CreateProductDto, merchantId: number) {
    const category = await this.categoryRepository.findById(data.categoryId);

    if (!category) throw new CategoryNotFound();

    const product = await this.productRepository.create(
      data,
      category,
      merchantId,
    );

    return product;
  }

  async updateProductAttributes(
    productId: number,
    attributes: ProductAttributesDto,
  ) {
    const product = await this.getProduct(productId);

    if (!product) throw new ProductNotFound();

    const category = await this.categoryRepository.findById(product.categoryId);

    const categoryAttributes = category?.attributes;

    if (!categoryAttributes)
      throw new ProductInvalidAttributes(categoryAttributes, attributes);

    const categoryAttributesMap = new Map(
      categoryAttributes.map((attr) => [attr.name, attr]),
    );

    const isValid = this.#validateProductAttributes(
      attributes,
      categoryAttributesMap,
    );

    if (!isValid)
      throw new ProductInvalidAttributes(categoryAttributes, attributes);

    const productExistingAttributes =
      await this.productRepository.getAllProductAttributes(productId);

    const existingMap = new Map(
      productExistingAttributes.map((productAttribute) => [
        productAttribute.attribute.name,
        productAttribute,
      ]),
    );

    const valuesToSave = Object.entries(attributes).map(([name, value]) => {
      const attribute = categoryAttributesMap.get(name) as Attribute;
      const existing = existingMap.get(name);

      if (existing) {
        existing.value = value.toString();
        return existing;
      }

      const newProductAttribute = new ProductAttribute();

      newProductAttribute.product = product;
      newProductAttribute.value = value.toString();
      newProductAttribute.attribute = attribute;

      return newProductAttribute;
    });

    await this.productRepository.upsertProductAttributes(valuesToSave);
  }

  async activateProduct(productId: number, merchantId: number) {
    const updatedRows = await this.productRepository.updateMerchantProduct(
      productId,
      merchantId,
      { isActive: true },
    );

    if (!updatedRows || updatedRows < 1) throw new ProductNotFound();
  }

  async deleteProduct(productId: number, merchantId: number) {
    const deletedRows = await this.productRepository.deleteProduct(
      productId,
      merchantId,
    );

    if (!deletedRows || deletedRows < 1) throw new ProductNotFound();
  }

  #validateProductAttributes(
    attributes: ProductAttributesDto,
    categoryAttributes: Map<string, Attribute>,
  ) {
    const invalidAttributes = Object.entries(attributes).some(
      ([name, value]) => {
        const categoryAttribute = categoryAttributes.get(name);

        if (!categoryAttribute) return true;

        if (
          categoryAttribute.type === AttributeType.NUMBER &&
          isNaN(Number(value))
        ) {
          return true;
        } else if (
          categoryAttribute.type === AttributeType.STRING &&
          typeof value !== 'string'
        ) {
          return true;
        } else if (
          categoryAttribute.type === AttributeType.BOOLEAN &&
          typeof value !== 'boolean'
        ) {
          return true;
        }

        return false;
      },
    );

    if (invalidAttributes) return false;

    return true;
  }
}
