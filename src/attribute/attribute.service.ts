import { Injectable } from '@nestjs/common';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { AttributeRepository } from './attribute.repository';
import { AttributeAlreadyExists } from './errors/attribute-already-exists';

@Injectable()
export class AttributeService {
  constructor(private readonly attributeRepository: AttributeRepository) {}

  async create(createAttributeDto: CreateAttributeDto) {
    const attribute = await this.attributeRepository.findByName(
      createAttributeDto.name,
    );

    if (attribute) throw new AttributeAlreadyExists();

    const id = await this.attributeRepository.create(createAttributeDto);

    return { id };
  }

  async getAll() {
    return this.attributeRepository.findAll();
  }
}
