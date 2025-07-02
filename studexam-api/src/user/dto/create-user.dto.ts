import { IsEmail, IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @Length(3, 50)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 100)
  // es. almeno 1 maiuscola, 1 numero, 1 simbolo
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, { message: 'Password too weak' })
  password: string;

  @IsString()
  @Length(2, 2)
  @IsOptional()
  language?: string;
}
