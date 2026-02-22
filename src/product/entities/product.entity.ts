import { IsDefined, IsNumber, IsString } from 'class-validator';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Category } from 'src/category/entities/category.entity';
import { ProductAttribute } from './product-attribute.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  @IsDefined()
  @IsNumber()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  @IsDefined()
  @Index()
  code: string;

  @Column({ type: 'varchar', nullable: true })
  @IsDefined()
  @IsString()
  title: string;

  @Column({ type: 'text', nullable: true })
  @IsDefined()
  @IsString()
  description?: string | null;

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'int', nullable: true })
  @IsDefined()
  @IsNumber()
  merchantId: number;

  @ManyToOne(() => User, (user) => user.products)
  @JoinColumn({ name: 'merchantId' })
  merchant: User;

  @OneToMany(() => ProductAttribute, (attribute) => attribute.product)
  attributes: ProductAttribute[];

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'int', nullable: true })
  @IsDefined()
  @IsNumber()
  categoryId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
