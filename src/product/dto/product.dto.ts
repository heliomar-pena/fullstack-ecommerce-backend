import { Expose } from 'class-transformer';
import { Category } from 'src/category/entities/category.entity';
import { ProductAttribute } from '../entities/product-attribute.entity';

export class ProductDto {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  title: string;

  @Expose()
  description?: string | null;

  @Expose()
  isActive: boolean;

  @Expose()
  category: Category;

  @Expose()
  attributes: ProductAttribute[];
}
