import { Test, TestingModule } from '@nestjs/testing';
import { PackagesService } from './packages.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PackageEntity } from './entities/package.entity';
import { Repository } from 'typeorm';

describe('PackagesService', () => {
  let service: PackagesService;
  let mockRepository: Partial<Repository<PackageEntity>>;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
        getCount: jest.fn().mockResolvedValue(0),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackagesService,
        {
          provide: getRepositoryToken(PackageEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PackagesService>(PackagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchByKeywords', () => {
    it('should throw error when no valid search criteria provided', async () => {
      await expect(service.searchByKeywords([], '', 1, 10)).rejects.toThrow(
        'Either provide at least 3 keywords or a partial name with at least 3 characters'
      );
    });

    it('should throw error when partial name has less than 3 characters and keywords less than 3', async () => {
      await expect(service.searchByKeywords(['tag1'], 'ab', 1, 10)).rejects.toThrow(
        'Either provide at least 3 keywords or a partial name with at least 3 characters'
      );
    });

    it('should accept valid partial name with 3 or more characters', async () => {
      const result = await service.searchByKeywords([], 'abc', 1, 10);
      expect(result).toEqual({ packages: [], total: 0 });
    });

    it('should accept 3 or more keywords without partial name', async () => {
      const result = await service.searchByKeywords(['tag1', 'tag2', 'tag3'], '', 1, 10);
      expect(result).toEqual({ packages: [], total: 0 });
    });

    it('should accept combination of valid partial name and keywords', async () => {
      const result = await service.searchByKeywords(['tag1', 'tag2'], 'abc', 1, 10);
      expect(result).toEqual({ packages: [], total: 0 });
    });
  });
});