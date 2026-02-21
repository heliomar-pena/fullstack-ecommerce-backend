import { SetMetadata } from '@nestjs/common';

export const AUTHORIZATION_KEY = 'authorizationRoles';
export const AuthRoles = (...rolesIds: number[]) =>
  SetMetadata(AUTHORIZATION_KEY, rolesIds);
