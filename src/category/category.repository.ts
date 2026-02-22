import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attribute } from 'src/attribute/entities/attribute.entity';
import { CreateCategoryDto } from 'src/category/dto/create-category.dto';
import { Category } from 'src/category/entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(
    createCategoryDto: Omit<CreateCategoryDto, 'attributes'>,
    attributes?: Attribute[],
  ) {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      attributes,
    });

    const saved = await this.categoryRepository.save(category);

    return saved.id;
  }

  findAll() {
    return this.categoryRepository.find({ relations: { attributes: true } });
  }

  findById(id: number) {
    return this.categoryRepository.findOne({
      where: { id },
      relations: { attributes: true },
    });
  }

  findByName(name: string) {
    return this.categoryRepository.findOne({
      where: { name },
      relations: { attributes: true },
    });
  }
}
