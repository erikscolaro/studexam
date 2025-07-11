import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PackageEntity } from './entities/package.entity';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(PackageEntity)
    private packageRepository: Repository<PackageEntity>,
  ) {}

  async create(createPackageDto: CreatePackageDto): Promise<PackageEntity> {
    const packageEntity = this.packageRepository.create(createPackageDto);
    return await this.packageRepository.save(packageEntity);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ packages: PackageEntity[]; total: number }> {
    const [packages, total] = await this.packageRepository.findAndCount({
      relations: ['author', 'tags'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return { packages, total };
  }

  async findOne(id: number): Promise<PackageEntity> {
    const packageEntity = await this.packageRepository.findOne({
      where: { id },
      relations: ['author', 'tags'],
    });

    if (!packageEntity) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }

    return packageEntity;
  }

  async update(
    id: number,
    updatePackageDto: UpdatePackageDto,
  ): Promise<PackageEntity> {
    const packageEntity = await this.findOne(id);
    Object.assign(packageEntity, updatePackageDto);
    return await this.packageRepository.save(packageEntity);
  }

  async remove(id: number): Promise<void> {
    const packageEntity = await this.findOne(id);
    await this.packageRepository.remove(packageEntity);
  }

  async searchPackages(
    keywords: string[] = [],
    partialName?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ packages: PackageEntity[]; total: number }> {
    // Validate input requirements
    const hasValidPartialName = partialName && partialName.trim().length >= 3;
    const hasEnoughKeywords = keywords.length >= 3;

    if (!hasValidPartialName && !hasEnoughKeywords) {
      throw new BadRequestException(
        'Either provide at least 3 keywords or a partial name with at least 3 characters',
      );
    }

    const queryBuilder = this.packageRepository
      .createQueryBuilder('package')
      .leftJoinAndSelect('package.author', 'author')
      .leftJoinAndSelect('package.tags', 'tags');

    // Add partial name condition if valid
    if (hasValidPartialName) {
      queryBuilder.andWhere('package.name ILIKE :partialName', {
        partialName: `${partialName}%`,
      });
    }

    // Add keyword condition if provided
    if (keywords.length > 0) {
      queryBuilder.andWhere('tags.slug = ANY(:keywords)', {
        keywords,
      });
    }

    // Ordering logic
    if (keywords.length > 0) {
      queryBuilder
        .addSelect('COUNT(tags.id)', 'tag_count')
        .groupBy('package.id, author.id')
        .orderBy('tag_count', 'DESC')
        .addOrderBy('package.createdAt', 'DESC');
    } else {
      queryBuilder.orderBy('package.createdAt', 'DESC');
    }

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    // Single query with getManyAndCount for efficiency
    const [packages, total] = await queryBuilder.getManyAndCount();

    return { packages, total };
  }
}
