import { UserDto } from 'src/user/dto/user.dto';

export const USER_ROLE_CHANGED_EVENT_KEY = 'user.role.changed';
export class UserRoleChangedEvent extends UserDto {}
