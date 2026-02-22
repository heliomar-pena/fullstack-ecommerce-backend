import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User['id'] | undefined> {
    const result = await this.usersRepository.insert({
      ...createUserDto,
    });

    return result.identifiers[0].id as User['id'];
  }

  findOne(id: User['id']) {
    return this.usersRepository.findOne({ where: { id: id } });
  }

  findByEmail(email: User['email']) {
    return this.usersRepository.findOneBy({ email: email });
  }

  findOneWithRoles(id: User['id']) {
    return this.usersRepository.findOne({
      where: { id: id },
      relations: { roles: true },
    });
  }

  async assignRoleToUser(userId: number, roleId: number) {
    await this.dataSource
      .createQueryBuilder()
      .relation(User, 'roles')
      .of(userId)
      .add(roleId);
  }

  async updateUser(id: User['id'], updateUserDto: UpdateUserDto) {
    return this.usersRepository.update(id, updateUserDto);
  }
}
