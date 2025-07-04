import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { PublicUserDTO } from 'src/users/dto/public-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser({ email, password }: LoginUserDto): Promise<UserEntity | null> {
    const user: UserEntity | null =
      await this.usersService.findCompleteUserByEmail(email);
    if (user && (await user.verifyPassword(password))) {
      return user;
    }
    return null;
  }

  async login(user: PublicUserDTO) {
    const payload = { ...user };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
