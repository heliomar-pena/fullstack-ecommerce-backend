import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTHORIZATION_KEY } from '../decorators/authorization.decorator';
import { InsufficientPermissions } from '../errors/insufficient-permissions';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<number[]>(
      AUTHORIZATION_KEY,
      context.getHandler(),
    );

    if (roles.length === 0) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ user: { roles: { id: number }[] } }>();

    if (!request.user.roles.some((userRole) => roles.includes(userRole.id)))
      throw new InsufficientPermissions();

    return true;
  }
}
