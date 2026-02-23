import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserNotFound } from './errors/user-not-found';
import { UsersRepository } from './user.repository';
import { Role } from 'src/role/entities/role.entity';
import { RoleRepository } from 'src/role/role.repository';
import { InvalidRole } from 'src/auth/errors/invalid-role';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  USER_ROLE_CHANGED_EVENT_KEY,
  UserRoleChangedEvent,
} from './events/user-role-changed.event';

@Injectable()
export class UserService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly roleRepository: RoleRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne(id);
    if (!user) {
      throw new UserNotFound();
    }

    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async assignUserRole(id: User['id'], roleId: Role['id']) {
    const user = await this.usersRepository.findOneWithRoles(id);

    if (!user) throw new UserNotFound();

    const role = await this.roleRepository.findById(roleId);

    if (!role) {
      throw new InvalidRole();
    }

    const alreadyAssigned = user.roles.some(
      (assignedRole) => assignedRole.id === role.id,
    );

    if (alreadyAssigned) return;

    await this.usersRepository.assignRoleToUser(user.id, roleId);

    this.eventEmitter.emit(USER_ROLE_CHANGED_EVENT_KEY, {
      id: user.id,
      email: user.email,
      roles: [...user.roles, role],
    } satisfies UserRoleChangedEvent);
  }
}
