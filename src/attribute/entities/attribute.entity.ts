import { Expose } from 'class-transformer';
import { Category } from 'src/category/entities/category.entity';
import { ProductAttribute } from 'src/product/entities/product-attribute.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AttributeType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
}

@Entity()
export class Attribute {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ unique: true })
  @Expose()
  name: string;

  @Column({
    type: 'enum',
    enum: AttributeType,
  })
  @Expose()
  type: AttributeType;

  @OneToMany(
    () => ProductAttribute,
    (productAttribute) => productAttribute.attribute,
  )
  productAttributes: ProductAttribute[];

  @Column({
    nullable: true,
  })
  @Expose()
  unit?: string;

  @ManyToMany(() => Category, (ca) => ca.attributes)
  categoryAttributes: Category[];
}
