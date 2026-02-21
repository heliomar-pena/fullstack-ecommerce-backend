import { Controller, Get } from '@nestjs/common';
import { RoleService } from './role.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Serialize } from 'src/shared/interceptors/serialize.interceptor';
import { RolesDto } from './dto/roles-dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // TODO: Add admin decorator
  @Get('list')
  @ApiBearerAuth()
  @Serialize(RolesDto)
  async listRoles() {
    return this.roleService.listRoles();
  }
}
