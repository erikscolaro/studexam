import { Reflector } from '@nestjs/core';
import { UserRole } from '../userRoles';

export const Roles = Reflector.createDecorator<UserRole[]>();
