import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { ReqUser } from 'src/auth/decorators/request-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Serialize } from 'src/shared/interceptors/serialize.interceptor';

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

  // TODO: Add auth decorator
  @ApiBearerAuth()
  @Get(':id/roles/:roleId')
  async assignRole(
    @Param('id') userId: number,
    @Param('roleId') roleId: number,
  ) {
    await this.userService.assignUserRole(userId, roleId);
  }
}
