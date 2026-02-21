import { Exclude, Expose } from 'class-transformer';
import { Attribute } from 'src/attribute/entities/attribute.entity';

@Exclude()
export class CategoryDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  attributes: Attribute[];
}
