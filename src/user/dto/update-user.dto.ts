import { CreateUserDto } from './create-user.dto';
import { Role } from 'src/role/entities/role.entity';

export class UpdateUserDto {
  email?: CreateUserDto['email'];
  roles?: Role[];
}
