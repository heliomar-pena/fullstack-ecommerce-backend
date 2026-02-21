import { Exclude, Expose } from 'class-transformer';
import { AttributeType } from '../entities/attribute.entity';

@Exclude()
export class AttributeDto {
  @Expose()
  id: number;
  @Expose()
  name: string;
  @Expose()
  type: AttributeType;
  @Expose()
  unit?: string;
}
