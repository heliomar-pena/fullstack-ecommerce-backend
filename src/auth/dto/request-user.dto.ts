import { OmitType } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';

export class RequestUserDto extends OmitType(User, ['password']) {}
