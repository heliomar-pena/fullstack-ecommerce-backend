import { Expose } from 'class-transformer';
import { User } from '../entities/user.entity';
import { UserDto } from './user.dto';

export class ListAllUsersDto extends UserDto {
  @Expose()
  createdAt: User['createdAt'];
  @Expose()
  updatedAt: User['updatedAt'];
}
