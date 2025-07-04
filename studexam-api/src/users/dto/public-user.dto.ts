import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { Expose } from 'class-transformer';

export class PublicUserDTO {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @IsString()
  @Length(3, 50)
  username: string;

  @Expose()
  @IsInt()
  points: number;

  @Expose()
  @IsEnum(UserRole)
  role: UserRole;
}
