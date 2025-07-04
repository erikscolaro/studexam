import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuardCompleteUser extends AuthGuard('jwt-complete') {}
