import { Injectable } from '@nestjs/common';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Attribute } from './entities/attribute.entity';

@Injectable()
export class AttributeRepository {
  constructor(
    @InjectRepository(Attribute)
    private attributeRepository: Repository<Attribute>,
  ) {}

  async create(createAttributeDto: CreateAttributeDto) {
    const result = await this.attributeRepository.insert(createAttributeDto);

    return result.identifiers[0].id as Attribute['id'];
  }

  findAll() {
    return this.attributeRepository.find();
  }

  findByIds(ids: Attribute['id'][]) {
    return this.attributeRepository.findBy({
      id: In(ids),
    });
  }

  findByName(name: string) {
    return this.attributeRepository.findOne({ where: { name } });
  }
}
