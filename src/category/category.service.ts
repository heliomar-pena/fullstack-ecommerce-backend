import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryAlreadyExists } from './errors/category-already-exists';
import { AttributeRepository } from 'src/attribute/attribute.repository';
import { CategoryAttributeNotFound } from './errors/category-attribute-not-found';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly attributeRepository: AttributeRepository,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryRepository.findByName(
      createCategoryDto.name,
    );

    if (category) throw new CategoryAlreadyExists();

    const attributes = await this.attributeRepository.findByIds(
      createCategoryDto.attributes,
    );

    const notFoundAttributes = createCategoryDto.attributes.filter(
      (id) => !attributes.some((attribute) => attribute.id === id),
    );

    if (notFoundAttributes.length)
      throw new CategoryAttributeNotFound(
        `The next attributes were not found: ${notFoundAttributes.join(', ')}`,
      );

    const id = await this.categoryRepository.create(
      createCategoryDto,
      attributes,
    );

    return { id };
  }

  async getAll() {
    return this.categoryRepository.findAll();
  }
}
