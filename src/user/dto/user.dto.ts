import { Expose } from 'class-transformer';
import { Role } from 'src/role/entities/role.entity';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  roles?: Role[];
}
