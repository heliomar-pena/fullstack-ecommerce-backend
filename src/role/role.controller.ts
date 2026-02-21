import { Controller, Get } from '@nestjs/common';
import { RoleService } from './role.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Serialize } from 'src/shared/interceptors/serialize.interceptor';
import { RolesDto } from './dto/roles-dto';
import { AuthRoles } from 'src/auth/decorators/authorization.decorator';
import { RoleIds } from './enum/role.enum';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @AuthRoles(RoleIds.Admin)
  @Get('list')
  @ApiBearerAuth()
  @Serialize(RolesDto)
  async listRoles() {
    return this.roleService.listRoles();
  }
}
