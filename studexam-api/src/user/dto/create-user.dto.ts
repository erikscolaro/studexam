import { IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(3, 50)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can contain only letters, numbers, and underscores',
  })
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
