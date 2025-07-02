import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Length, Matches } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class PublicUserDTO {
  @IsString()
  @Length(3, 50)
  username: string;

  @IsInt()
  points: number

  @IsEnum(UserRole)
  role: UserRole
}
