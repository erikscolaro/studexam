import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Response,
  Get,
  UseGuards,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { User } from './decorators/user.decorator';
import { PublicUserDTO } from 'src/users/dto/public-user.dto';
import { JwtAuthGuardPartialUser } from './guards/jwt-auth-partial.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginUserDto,
    @Response({ passthrough: true }) response: ExpressResponse,
  ) {
    const user = await this.authService.validateUser(loginDto);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { access_token } = await this.authService.login(user);

    // Imposta il token JWT come cookie HTTP-only
    response.cookie('jwt', access_token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 6 * 60 * 60 * 1000, // 6 ore (stesso di auth.module.ts)
    });

    return user;
  }

  @Get('current')
  @UseGuards(JwtAuthGuardPartialUser)
  async getCurrentUser(@User() user: PublicUserDTO) {
    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Response({ passthrough: true }) response: ExpressResponse) {
    response.clearCookie('jwt');
    return { message: 'Logout successful' };
  }
}
