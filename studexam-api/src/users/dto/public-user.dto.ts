import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { Expose } from 'class-transformer';
import { UserRole } from 'src/common/userRoles';

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

  @Expose()
  @IsString()
  @Length(2, 2)
  @IsOptional()
  language: string;
}
