import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TagEntity } from './entities/tag.entity';
import { QueryFailedError, Repository } from 'typeorm';
import slugify from 'slugify';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(TagEntity)
    private repo: Repository<TagEntity>,
  ) {}

  async create(createTagDto: CreateTagDto, userId?: string) {
    const tag = {
      name: createTagDto.name,
      slug: slugify(createTagDto.name, { lower: true }),
      created_at: new Date(),
      author: userId ? { id: userId } : undefined,
    };
    try {
      const res = this.repo.save(tag);
      return res;
    } catch (err) {
      if (err instanceof QueryFailedError) {
        throw new ConflictException('A tag similar to this already exists.');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async findAll(
    page?: number,
    limit?: number,
    partialName?: string,
    active?: boolean,
  ) {
    try {
      const queryBuilder = this.repo.createQueryBuilder('tag');

      if (partialName) {
        const slugifiedName = slugify(partialName, { lower: true });
        queryBuilder.where('tag.slug LIKE :slugifiedName', {
          slugifiedName: `${slugifiedName}%`,
        });
      }

      if (page && limit) {
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
      }

      if (active !== undefined) {
        queryBuilder.andWhere('tag.active = :active', { active });
      }

      const tags = await queryBuilder.getMany();

      return {
        tags,
      };
    } catch {
      throw new InternalServerErrorException('Failed to fetch tags');
    }
  }

  async findOne(id: string): Promise<TagEntity> {
    try {
      const tag = await this.repo.findOneBy({ id });
      if (!tag) {
        throw new InternalServerErrorException('Tag not found');
      }

      return tag;
    } catch {
      throw new InternalServerErrorException('Failed to fetch tag');
    }
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    try {
      const tag = await this.repo.findOneBy({ id });
      if (!tag) {
        throw new InternalServerErrorException('Tag not found');
      }

      const updatedTag = {
        ...tag,
        ...updateTagDto,
        slug: updateTagDto.name ? slugify(updateTagDto.name) : tag.slug,
      };

      return await this.repo.save(updatedTag);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        throw new ConflictException('A tag with this name already exists');
      }
      throw new InternalServerErrorException('Failed to update tag');
    }
  }

  async remove(id: string) {
    try {
      const tag = await this.repo.findOneBy({ id });
      if (!tag) {
        throw new InternalServerErrorException('Tag not found');
      }

      await this.repo.remove(tag);
      return { message: 'Tag deleted successfully' };
    } catch {
      throw new InternalServerErrorException('Failed to delete tag');
    }
  }
}
