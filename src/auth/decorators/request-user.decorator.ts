import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUserDto } from '../dto/request-user.dto';

export const ReqUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): RequestUserDto => {
    const req = context.switchToHttp().getRequest<{ user: RequestUserDto }>();
    return req.user;
  },
);
