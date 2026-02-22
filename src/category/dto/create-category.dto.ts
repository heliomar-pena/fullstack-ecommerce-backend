import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { Attribute } from 'src/attribute/entities/attribute.entity';

export class CreateCategoryDto {
  id: number;

  @ApiProperty({
    description: 'The name of the category',
    type: 'string',
    example: 'Electronics',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The attributes associated with the category',
    type: 'array',
    example: [1, 2, 3],
  })
  @IsArray()
  @IsNumber(undefined, { each: true })
  attributes: Attribute['id'][];
}
