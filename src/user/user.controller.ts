import { Controller, Get, Param, Post } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { ReqUser } from 'src/auth/decorators/request-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Serialize } from 'src/shared/interceptors/serialize.interceptor';
import { AuthRoles } from 'src/auth/decorators/authorization.decorator';
import { RoleIds } from 'src/role/enum/role.enum';
import { ListAllUsersDto } from './dto/list-all-users.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Get('profile')
  @Serialize(UserDto)
  profile(@ReqUser() user: User) {
    return this.userService.findById(user.id);
  }

  @ApiBearerAuth()
  @Serialize(ListAllUsersDto)
  @AuthRoles(RoleIds.Admin)
  @Get('list')
  list() {
    return this.userService.findAll();
  }

  @AuthRoles(RoleIds.Admin)
  @ApiBearerAuth()
  @Post(':id/roles/:roleId')
  async assignRole(
    @Param('id') userId: number,
    @Param('roleId') roleId: number,
  ) {
    await this.userService.assignUserRole(userId, roleId);
  }
}
