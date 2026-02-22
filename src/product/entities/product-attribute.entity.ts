import { IsDefined, IsNumber, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Attribute } from 'src/attribute/entities/attribute.entity';
import { Expose } from 'class-transformer';

@Entity()
export class ProductAttribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @Expose()
  value: string;

  @Column()
  @IsDefined()
  @IsNumber()
  @Expose()
  attributeId: number;

  @ManyToOne(() => Attribute, (attribute) => attribute.productAttributes)
  @Expose()
  attribute: Attribute;

  @Column()
  @IsDefined()
  @IsNumber()
  productId: number;

  @ManyToOne(() => Product, (product) => product.attributes)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
