import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public-route.decorator';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() user: CreateUserDto) {
    return this.authService.login(user.email, user.password);
  }

  @Post('register')
  register(@Body() user: CreateUserDto) {
    return this.authService.register(user);
  }
}
