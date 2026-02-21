import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { RoleNotFound } from './errors/role-not-found';

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}

  async findById(roleId: number) {
    const role = await this.roleRepository.findOne({
      where: {
        id: roleId,
      },
    });
    if (!role) {
      throw new RoleNotFound();
    }
    return role;
  }

  async findAll() {
    return this.roleRepository.find();
  }
}
