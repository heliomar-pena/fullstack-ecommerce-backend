import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { UsersRepository } from 'src/user/user.repository';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { PartialType } from '@nestjs/swagger';
import { authConfig } from 'src/auth/auth.config';
import type { ConfigType } from '@nestjs/config';

export class OverrideCreateUserDto extends PartialType(CreateUserDto) {}

@Injectable()
export class UserFactory {
  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject(authConfig.KEY)
    private auth: ConfigType<typeof authConfig>,
  ) {}

  private buildDefaults(): Required<CreateUserDto> {
    const random = Math.floor(Math.random() * 1000000);

    return {
      email: `test${random}@mail.com`,
      password: 'password123',
    };
  }

  async build(overrides: OverrideCreateUserDto = {}): Promise<User> {
    const values = {
      ...this.buildDefaults(),
      ...overrides,
    };

    const hashedPassword = await bcrypt.hash(values.password, this.auth.salt);

    const user = new User();
    user.email = values.email;
    user.password = hashedPassword;

    return user;
  }

  async create(
    overrides: OverrideCreateUserDto = {},
    roles?: number[],
  ): Promise<User> {
    const user = await this.build(overrides);

    const id = await this.usersRepository.create(user);

    if (!id) throw new Error('Failed to create user');

    if (roles && roles.length > 0) {
      await Promise.all(
        roles.map((role) => this.usersRepository.assignRoleToUser(id, role)),
      );
    }

    user.id = id;

    return user;
  }

  async createMany(
    count: number,
    overrides: OverrideCreateUserDto = {},
    roles?: number[],
  ): Promise<User[]> {
    const users: User[] = [];

    for (let i = 0; i < count; i++) {
      users.push(await this.create(overrides, roles));
    }

    return users;
  }
}
