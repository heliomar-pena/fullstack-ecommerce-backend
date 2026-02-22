import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    type: 'number',
    example: 1,
    description: 'ID of the category that the product belongs to',
  })
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({
    type: 'string',
    example: 'Product Title',
    description: 'The title of the product',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    type: 'string',
    example: 'PRD-001',
    description: 'Unique code of the product',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    type: 'string',
    example: 'This is a description of the product',
    description: 'The description of the product',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
