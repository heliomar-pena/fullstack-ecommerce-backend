import { Expose } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  ManyToMany,
} from 'typeorm';

@Entity()
export class Role {
  @PrimaryColumn()
  id!: number;

  @Expose()
  @Column({ type: 'varchar', length: 120, unique: true })
  name: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
