import { Injectable } from '@nestjs/common';
import { Category } from 'src/category/entities/category.entity';
import { CategoryRepository } from 'src/category/category.repository';
import { PartialType } from '@nestjs/swagger';
import { CategoryDto } from 'src/category/dto/category.dto';

export class OverrideCreateCategoryDto extends PartialType(CategoryDto) {
  random_name_prefix?: string;
}

@Injectable()
export class CategoryFactory {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  private randomName(prefix = 'category') {
    const r = Math.floor(Math.random() * 1000000);
    return `${prefix}_${r}`;
  }

  build(overrides: OverrideCreateCategoryDto = {}): Category {
    const category = new Category();
    category.name =
      overrides.name ?? this.randomName(overrides.random_name_prefix);
    category.attributes = overrides.attributes ?? [];
    return category;
  }

  async create(overrides: OverrideCreateCategoryDto = {}): Promise<Category> {
    const category = this.build(overrides);

    const attributes = category.attributes.map((attr) => attr.id);

    const id = await this.categoryRepository.create({
      ...category,
      attributes,
    });

    category.id = id;

    return category;
  }

  async createMany(
    count: number,
    overrides: OverrideCreateCategoryDto = {},
  ): Promise<Category[]> {
    const categories: Category[] = [];
    for (let i = 0; i < count; i++) {
      categories.push(await this.create(overrides));
    }
    return categories;
  }

  async getOrCreateByName(
    name: string,
    overrides: Omit<OverrideCreateCategoryDto, 'name'> = {},
  ): Promise<Category> {
    const existing = await this.categoryRepository.findByName(name);
    if (existing) return existing;

    return this.create({ ...overrides, name });
  }
}
