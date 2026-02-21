import { ApiProperty } from '@nestjs/swagger';
import { AttributeType } from '../entities/attribute.entity';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateAttributeDto {
  @ApiProperty({
    description: 'The name of the attribute',
    example: 'Color',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The type of the attribute',
    enum: AttributeType,
    example: AttributeType.STRING,
  })
  @IsEnum(AttributeType)
  type: AttributeType;

  @ApiProperty({
    description: 'The unit of the attribute (e.g., "kg", "cm")',
    example: 'kg',
  })
  @IsString()
  @IsOptional()
  unit?: string;
}
