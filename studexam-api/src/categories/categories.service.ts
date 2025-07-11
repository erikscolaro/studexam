import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { IsNull, Repository } from 'typeorm';
import { ILike } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private repo: Repository<CategoryEntity>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
    try {
      const category = this.repo.create({
        ...createCategoryDto,
        parentCategory: createCategoryDto.parentCategory
          ? { id: createCategoryDto.parentCategory }
          : undefined,
      });
      return await this.repo.save(category);
    } catch {
      throw new InternalServerErrorException('Failed to create category.');
    }
  }

  async findManyByPartialName(
    partialName: string,
    skip: number,
    take: number,
  ): Promise<CategoryEntity[]> {
    try {
      return await this.repo.find({
        where: {
          name: ILike(`${partialName}%`),
        },
        skip,
        take,
      });
    } catch {
      throw new InternalServerErrorException('Failed to find categories.');
    }
  }

  async findManyByName(
    name: string,
    skip: number,
    take: number,
  ): Promise<CategoryEntity[]> {
    try {
      return await this.repo.find({
        where: { name },
        skip,
        take,
      });
    } catch {
      throw new InternalServerErrorException('Failed to find categories.');
    }
  }

  async findRootCategories(
    skip: number,
    take: number,
  ): Promise<CategoryEntity[]> {
    try {
      return await this.repo.find({
        where: { parentCategory: IsNull() },
        skip,
        take,
      });
    } catch {
      throw new InternalServerErrorException('Failed to find categories.');
    }
  }

  async findOne(id: number) {
    try {
      return await this.repo.findOne({
        where: {
          id,
        },
        relations: ['childCategories'],
      });
    } catch {
      throw new InternalServerErrorException('Failed to find category.');
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    Object.assign(category, updateCategoryDto);
    try {
      return await this.repo.save(category);
    } catch (err) {
      throw new InternalServerErrorException('Failed to update category.');
    }
  }

  async remove(id: number) {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    try {
      return await this.repo.remove(category);
    } catch (err) {
      throw new InternalServerErrorException('Failed to delete category.');
    }
  }
}
