import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { ReqUser } from 'src/auth/decorators/request-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Serialize } from 'src/shared/interceptors/serialize.interceptor';
import { AuthRoles } from 'src/auth/decorators/authorization.decorator';
import { RoleIds } from 'src/role/enum/role.enum';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Serialize(UserDto)
  @Get('profile')
  @UseInterceptors(ClassSerializerInterceptor)
  profile(@ReqUser() user: User): Promise<UserDto> {
    return this.userService.findById(user.id);
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
