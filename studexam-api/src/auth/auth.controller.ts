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
import { User } from '../common/decorators/user.decorator';
import { PublicUserDTO } from 'src/users/dto/public-user.dto';
import { JwtAuthGuardPartialUser } from '../common/guards/jwt-auth-partial.guard';
import { instanceToPlain } from 'class-transformer';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() createDto: CreateUserDto) {
    return this.usersService.createUser(createDto);
  }

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

    return instanceToPlain(user, { excludeExtraneousValues: true });
  }

  @Get('current')
  @UseGuards(JwtAuthGuardPartialUser)
  async getCurrentUser(@User() user: PublicUserDTO) {
    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuardPartialUser)
  logout(@Response({ passthrough: true }) response: ExpressResponse) {
    response.clearCookie('jwt');
  }
}
