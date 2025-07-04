import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    // obtain user obj from request, use after authguard
    const request = context.switchToHttp().getRequest();
    const userRole = request.user.role;
    if (roles.includes(userRole)) {
      return true;
    } else {
      throw new ForbiddenException("You don't have the rights.");
    }
  }
}
