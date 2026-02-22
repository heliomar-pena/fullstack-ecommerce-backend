import { UserDto } from 'src/user/dto/user.dto';

export const USER_CREATED_EVENT_KEY = 'user.created';
export class UserCreatedEvent extends UserDto {}
