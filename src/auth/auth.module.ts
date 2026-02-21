import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { User } from 'src/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RoleModule } from '../role/role.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service'; 
import { ConfigModule, ConfigType } from '@nestjs/config';
import { authConfig } from './auth.config';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(authConfig)],
      useFactory: (configuration: ConfigType<typeof authConfig>) => ({
        global: true,
        secret: configuration.jwtSecret,
        signOptions: { expiresIn: '30m', algorithm: 'ES256' },
      }),
      inject: [authConfig.KEY],
    }),
    RoleModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService],
  exports: [],
})
export class AuthModule {}
