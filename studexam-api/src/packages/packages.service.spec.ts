import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackagesService } from './packages.service';
import { PackageEntity } from './entities/package.entity';
import { TagEntity } from '../tags/entities/tag.entity';
import { UserEntity } from '../users/entities/user.entity';

describe('PackagesService', () => {
  let service: PackagesService;
  let packageRepository: Repository<PackageEntity>;
  let tagRepository: Repository<TagEntity>;

  const mockPackageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockTagRepository = {
    findBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackagesService,
        {
          provide: getRepositoryToken(PackageEntity),
          useValue: mockPackageRepository,
        },
        {
          provide: getRepositoryToken(TagEntity),
          useValue: mockTagRepository,
        },
      ],
    }).compile();

    service = module.get<PackagesService>(PackagesService);
    packageRepository = module.get<Repository<PackageEntity>>(getRepositoryToken(PackageEntity));
    tagRepository = module.get<Repository<TagEntity>>(getRepositoryToken(TagEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should search packages by username and keywords', async () => {
      const mockUser = { id: '1', username: 'testuser' } as UserEntity;
      const mockTag1 = { id: '1', slug: 'tag1', name: 'Tag 1' } as TagEntity;
      const mockTag2 = { id: '2', slug: 'tag2', name: 'Tag 2' } as TagEntity;
      
      const mockPackage = {
        id: '1',
        name: 'Test Package',
        user: mockUser,
        tags: [mockTag1, mockTag2],
        isPublic: true,
      } as PackageEntity;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockPackage]),
      };

      mockPackageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const searchDto = {
        username: 'test',
        keywords: 'tag1,tag2',
      };

      const result = await service.search(searchDto);

      expect(result).toEqual([mockPackage]);
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('package.user', 'user');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('package.tags', 'tags');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('package.isPublic = :isPublic', { isPublic: true });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.username ILIKE :username', { username: '%test%' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('tags.slug IN (:...keywordSlugs)', { keywordSlugs: ['tag1', 'tag2'] });
    });

    it('should filter packages without matching keywords when keywords are provided', async () => {
      const mockUser = { id: '1', username: 'testuser' } as UserEntity;
      const mockTag1 = { id: '1', slug: 'tag1', name: 'Tag 1' } as TagEntity;
      const mockTag2 = { id: '2', slug: 'other', name: 'Other Tag' } as TagEntity;
      
      const mockPackage1 = {
        id: '1',
        name: 'Test Package 1',
        user: mockUser,
        tags: [mockTag1], // has matching tag
        isPublic: true,
      } as PackageEntity;

      const mockPackage2 = {
        id: '2',
        name: 'Test Package 2',
        user: mockUser,
        tags: [mockTag2], // no matching tag
        isPublic: true,
      } as PackageEntity;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockPackage1, mockPackage2]),
      };

      mockPackageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const searchDto = {
        keywords: 'tag1',
      };

      const result = await service.search(searchDto);

      // Should only return package1 which has the matching tag
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });
});