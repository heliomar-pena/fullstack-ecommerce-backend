import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';

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

    return role;
  }

  async findAll() {
    return this.roleRepository.find();
  }
}
