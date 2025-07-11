import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PublicUserDTO } from '../../users/dto/public-user.dto';

/**
 * User decorator - extracts the authenticated user from the request
 * @returns PublicUserDTO - the public user data from JWT payload
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PublicUserDTO => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
