import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateTagDto {
  @Expose()
  @IsNotEmpty()
  @Length(3, 50)
  name: string;

  @Expose()
  @IsOptional()
  active: boolean;
}
