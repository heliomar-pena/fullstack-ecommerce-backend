import { Expose } from 'class-transformer';
import { Category } from 'src/category/entities/category.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum AttributeType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
}

@Entity()
export class Attribute {
  @PrimaryGeneratedColumn()
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

  @Column({
    nullable: true,
  })
  @Expose()
  unit?: string;

  @ManyToMany(() => Category, (ca) => ca.attributes)
  categoryAttributes: Category[];
}
