import { Expose } from 'class-transformer';
import { Attribute } from 'src/attribute/entities/attribute.entity';
import { Product } from 'src/product/entities/product.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  @Expose()
  name: string;

  @ManyToMany(() => Attribute, (attribute) => attribute.categoryAttributes)
  @JoinTable()
  @Expose()
  attributes: Attribute[];

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
