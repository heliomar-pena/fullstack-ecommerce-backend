import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    role: number,
  ): Promise<User['id'] | undefined> {
    const result = await this.usersRepository.insert({
      ...createUserDto,
      roles: [{ id: role }],
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

  async updateUser(updateUserDto: UpdateUserDto) {
    return this.usersRepository.save(updateUserDto);
  }
}
