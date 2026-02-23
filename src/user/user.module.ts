import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UsersRepository } from './user.repository';
import { RoleModule } from 'src/role/role.module';
import { UserCreatedListener } from './listeners/user-created.listener';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RoleModule],
  controllers: [UserController],
  providers: [UserService, UsersRepository, UserCreatedListener],
  exports: [UsersRepository],
})
export class UserModule {}
