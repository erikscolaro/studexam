import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PackageEntity } from './entities/package.entity';
import { TagEntity } from 'src/tags/entities/tag.entity';
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

    // Filter by partial username if provided
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

    // Filter by keywords if provided
    if (keywordSlugs.length > 0) {
      queryBuilder.andWhere('tags.slug IN (:...keywordSlugs)', { keywordSlugs });
    }

    // Get packages with tag count
    const packages = await queryBuilder.getMany();

    // If keywords were provided, sort by number of matching keywords
    if (keywordSlugs.length > 0) {
      packages.sort((a, b) => {
        const aMatchCount = a.tags.filter(tag => keywordSlugs.includes(tag.slug)).length;
        const bMatchCount = b.tags.filter(tag => keywordSlugs.includes(tag.slug)).length;
        return bMatchCount - aMatchCount; // Descending order
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