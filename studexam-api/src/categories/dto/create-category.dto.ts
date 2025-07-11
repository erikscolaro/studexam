import { IsInt, IsOptional, IsString, Length } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(3, 50)
  name: string;

  @IsString()
  @IsOptional()
  @Length(3, 100)
  description?: string;

  @IsInt()
  @IsOptional() //optional only for the admin that can create a root without parents
  parentCategory: number;
}
