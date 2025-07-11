import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PackageEntity } from './entities/package.entity';
import { TagEntity } from '../tags/entities/tag.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { SearchPackagesDto } from './dto/search-packages.dto';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(PackageEntity)
    private packageRepository: Repository<PackageEntity>,
    @InjectRepository(TagEntity)
    private tagRepository: Repository<TagEntity>,
  ) {}

  async create(createPackageDto: CreatePackageDto, userId: string): Promise<PackageEntity> {
    const packageEntity = this.packageRepository.create({
      ...createPackageDto,
      userId,
    });

    if (createPackageDto.tagIds && createPackageDto.tagIds.length > 0) {
      const tags = await this.tagRepository.findBy({ id: In(createPackageDto.tagIds) });
      packageEntity.tags = tags;
    }

    return this.packageRepository.save(packageEntity);
  }

  async search(searchDto: SearchPackagesDto): Promise<PackageEntity[]> {
    const queryBuilder = this.packageRepository
      .createQueryBuilder('package')
      .leftJoinAndSelect('package.user', 'user')
      .leftJoinAndSelect('package.tags', 'tags')
      .where('package.isPublic = :isPublic', { isPublic: true });

    // Filter by partial username if provided (first step as per requirements)
    if (searchDto.username) {
      queryBuilder.andWhere('user.username ILIKE :username', {
        username: `%${searchDto.username}%`,
      });
    }

    // Parse keywords from query string if provided
    let keywordSlugs: string[] = [];
    if (searchDto.keywords) {
      keywordSlugs = searchDto.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    } else if (searchDto.keywordList) {
      keywordSlugs = searchDto.keywordList;
    }

    // Filter by keywords if provided (second step: find packages with at least one matching keyword)
    if (keywordSlugs.length > 0) {
      queryBuilder.andWhere('tags.slug IN (:...keywordSlugs)', { keywordSlugs });
    }

    // Get packages
    let packages = await queryBuilder.getMany();

    // If keywords were provided, we need to:
    // 1. Only include packages that have at least one matching tag
    // 2. Sort by number of matching keywords (descending)
    if (keywordSlugs.length > 0) {
      // Filter packages to only include those with matching tags
      packages = packages.filter(pkg => 
        pkg.tags && pkg.tags.some(tag => keywordSlugs.includes(tag.slug))
      );

      // Sort by number of matching keywords (descending)
      packages.sort((a, b) => {
        const aMatchCount = a.tags.filter(tag => keywordSlugs.includes(tag.slug)).length;
        const bMatchCount = b.tags.filter(tag => keywordSlugs.includes(tag.slug)).length;
        return bMatchCount - aMatchCount;
      });
    } else {
      // If no keywords specified, sort by total tag count (alternative interpretation)
      packages.sort((a, b) => {
        const aTagCount = a.tags?.length || 0;
        const bTagCount = b.tags?.length || 0;
        return bTagCount - aTagCount;
      });
    }

    return packages;
  }

  async findAll(): Promise<PackageEntity[]> {
    return this.packageRepository.find({
      where: { isPublic: true },
      relations: ['user', 'tags'],
    });
  }

  async findOne(id: string): Promise<PackageEntity | null> {
    return this.packageRepository.findOne({
      where: { id, isPublic: true },
      relations: ['user', 'tags'],
    });
  }
}