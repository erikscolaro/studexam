import { IsOptional, IsString, IsArray } from 'class-validator';

export class SearchPackagesDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  keywords?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywordList?: string[];
}