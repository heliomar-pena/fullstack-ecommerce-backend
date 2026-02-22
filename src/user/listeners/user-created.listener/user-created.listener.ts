import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  USER_CREATED_EVENT_KEY,
  UserCreatedEvent,
} from 'src/auth/events/user-created.event';
import { RoleIds } from 'src/role/enum/role.enum';
import { RoleRepository } from 'src/role/role.repository';
import { UsersRepository } from 'src/user/user.repository';

@Injectable()
export class UserCreatedListener {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  @OnEvent(USER_CREATED_EVENT_KEY)
  async handleUserCreatedEvent(data: UserCreatedEvent) {
    if (!data.roles || data.roles.length === 0) {
      const role = await this.roleRepository.findById(RoleIds.Customer);

      if (!role)
        throw new InternalServerErrorException('Customer role not found');

      await this.usersRepository.assignRoleToUser(data.id, role.id);
    }
  }
}
