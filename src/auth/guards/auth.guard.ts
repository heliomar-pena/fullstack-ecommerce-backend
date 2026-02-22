import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public-route.decorator';
import { Request } from 'express';
import { authConfig } from '../auth.config';
import type { ConfigType } from '@nestjs/config';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';
import { RequestUserDto } from '../dto/request-user.dto';
import { ExpiredToken } from '../errors/expired-token.error';
import { InvalidToken } from '../errors/invalid-token.error';
import { UsersRepository } from 'src/user/user.repository';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly reflector: Reflector,
    @Inject(authConfig.KEY)
    private auth: ConfigType<typeof authConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    try {
      const request = context
        .switchToHttp()
        .getRequest<Request & { user?: RequestUserDto }>();
      const bearerToken = this.extractTokenFromHeader(request);

      if (!bearerToken) return false;

      const payload = this.jwtService.verify<JwtPayloadDto>(bearerToken, {
        secret: this.auth.jwtSecret,
        issuer: this.auth.issuer,
      });

      const user = await this.usersRepository.findOneWithRoles(payload.id);

      if (!user) throw new InvalidToken();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...restUser } = user;

      request.user = restUser;

      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) throw new ExpiredToken();
      throw new InvalidToken();
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const auth = request.headers.authorization;

    if (!auth) return undefined;

    const [type, token] = auth?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
