import { Injectable } from '@nestjs/common';
import {
  Attribute,
  AttributeType,
} from 'src/attribute/entities/attribute.entity';
import { AttributeRepository } from 'src/attribute/attribute.repository';
import { PartialType } from '@nestjs/swagger';
import { CreateAttributeDto } from 'src/attribute/dto/create-attribute.dto';

export class OverrideCreateAttributeDto extends PartialType(
  CreateAttributeDto,
) {
  random_name_prefix?: string;
}

@Injectable()
export class AttributeFactory {
  constructor(private readonly attributeRepository: AttributeRepository) {}

  private randomName(prefix = 'attr') {
    const r = Math.floor(Math.random() * 1000000);
    return `${prefix}_${r}`;
  }

  build(overrides: OverrideCreateAttributeDto = {}): Attribute {
    const attr = new Attribute();
    attr.name = overrides.name ?? this.randomName(overrides.random_name_prefix);
    attr.type = overrides.type ?? AttributeType.STRING;
    attr.unit = overrides.unit;
    return attr;
  }

  async create(overrides: OverrideCreateAttributeDto = {}): Promise<Attribute> {
    const attr = this.build(overrides);

    const attributeId = await this.attributeRepository.create(attr);

    attr.id = attributeId;

    return attr;
  }

  async createMany(
    count: number,
    overrides: OverrideCreateAttributeDto = {},
  ): Promise<Attribute[]> {
    const result: Attribute[] = [];
    for (let i = 0; i < count; i++) {
      result.push(await this.create(overrides));
    }
    return result;
  }

  async getOrCreateByName(
    name: string,
    overrides: Omit<OverrideCreateAttributeDto, 'name'> = {},
  ): Promise<Attribute> {
    const existing = await this.attributeRepository.findByName(name);

    if (existing) return existing;

    return this.create({ ...overrides, name });
  }
}
