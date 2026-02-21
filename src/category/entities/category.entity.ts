import { Attribute } from 'src/attribute/entities/attribute.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  // OneToMany,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @ManyToMany(() => Attribute, (attribute) => attribute.categoryAttributes)
  @JoinTable()
  attributes: Attribute[];

  // @OneToMany(() => Product, (product) => product.category)
  // products: Product;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
