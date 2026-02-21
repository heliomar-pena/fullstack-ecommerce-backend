import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { Role } from 'src/role/entities/role.entity';

export class UpdateUserDto extends PickType(CreateUserDto, ['email']) {
  roles?: Role[];
}
