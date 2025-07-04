import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { PublicUserDTO } from 'src/users/dto/public-user.dto';
import { Request } from 'express';

@Injectable()
export class JwtStrategyPartialUser extends PassportStrategy(Strategy, 'jwt-partial') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategyPartialUser.extractJWTFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
    });
  }

  private static extractJWTFromCookie(req: Request): string | null {
    if (req.cookies && 'jwt' in req.cookies) {
      return req.cookies.jwt;
    }
    return null;
  }

  async validate(payload: any): Promise<PublicUserDTO> {
    // Verifica solo che il JWT sia valido (non scaduto, firma corretta)
    // Restituisce direttamente il payload come PublicUserDTO senza query al database
    return payload as PublicUserDTO;
  }
}
