import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { PublicUserDTO } from './dto/public-user.dto';
import { UserRole } from 'src/common/userRoles';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private repo: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    try {
      const user = this.repo.create(createUserDto);
      return await this.repo.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException('Email already in use.');
      }
      throw new InternalServerErrorException(
        'Internal server error. Try again later.',
      );
    }
  }

  // Search users by username with pagination and complete/public flag
  async findUsersByUsernameLike(
    username: string,
    returnComplete: boolean = false,
    page: number = 1,
    limit: number = 10,
  ): Promise<UserEntity[] | PublicUserDTO[]> {
    try {
      const queryBuilder = this.repo.createQueryBuilder('user');

      queryBuilder.where('user.username ILIKE :username', {
        username: `${username}%`,
      });
      queryBuilder.skip((page - 1) * limit);
      queryBuilder.take(limit);

      const users = await queryBuilder.getMany();

      if (returnComplete) {
        return users;
      } else {
        // Mask user fields for safety
        return users.map((user) =>
          plainToInstance(PublicUserDTO, user, {
            excludeExtraneousValues: true,
          }),
        );
      }
    } catch {
      throw new InternalServerErrorException(
        'Internal server error. Try again later.',
      );
    }
  }

  // Unified search method with flag for complete user or public DTO
  async findUser(
    returnComplete: boolean = false,
    id?: string,
    email?: string,
  ): Promise<UserEntity | PublicUserDTO | null> {
    try {
      const queryBuilder = this.repo.createQueryBuilder('user');

      if (id) {
        queryBuilder.where('user.id = :id', { id });
      } else if (email) {
        queryBuilder.where('user.email = :email', { email });
      } else {
        throw new BadRequestException('Either id or email must be provided');
      }

      const user = await queryBuilder.getOne();

      if (!user) {
        if (returnComplete) {
          return null;
        } else {
          throw new NotFoundException('User not found');
        }
      }

      if (returnComplete) {
        return user;
      } else {
        return plainToInstance(PublicUserDTO, user, {
          excludeExtraneousValues: true,
        });
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Internal server error. Try again later.',
      );
    }
  }

  async updateUser(
    id: string,
    updateData?: UpdateUserDto,
    role?: UserRole,
  ): Promise<UserEntity> {
    try {
      const user = await this.repo.findOneBy({ id });
      if (!user) throw new NotFoundException(`User with ID ${id} not found`);

      if (updateData) {
        Object.assign(user, updateData);
      }

      if (role !== undefined) {
        user.role = role;
      }

      return await this.repo.save(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Internal server error. Try again later.',
      );
    }
  }

  async removeUser(id: string): Promise<void> {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    await this.repo.remove(user);
  }

  // Methods for authentication service
  async findCompleteUserByEmail(email: string): Promise<UserEntity | null> {
    return (await this.findUser(true, undefined, email)) as UserEntity | null;
  }

  async findCompleteUserById(id: string): Promise<UserEntity | null> {
    return (await this.findUser(true, id)) as UserEntity | null;
  }
}
