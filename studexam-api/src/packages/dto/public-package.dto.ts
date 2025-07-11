import { Expose, Transform } from 'class-transformer';
import { TagEntity } from '../../tags/entities/tag.entity';

export class PublicPackageDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  version: string;

  @Expose()
  isPublic: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  username: string;

  @Expose()
  @Transform(({ obj }) => obj.tags?.map((tag: TagEntity) => ({
    id: tag.id,
    slug: tag.slug,
    name: tag.name,
    description: tag.description
  })) || [])
  tags: Partial<TagEntity>[];

  @Expose()
  tagCount: number;
}