import {
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
import { ILike } from 'typeorm';
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
    // perform convertion to create user dto to user entity
    const user = this.repo.create(createUserDto);
    // store in the db
    try {
      return await this.repo.save(user);
    } catch (err) {
      if (err instanceof QueryFailedError)
        throw new ConflictException('Email already in use.');
      else
        throw new InternalServerErrorException(
          'Internal server error. Try again later.',
        );
    }
  }

  // needs for searching other users to implement follow technique
  async findPublicUsersByUsernameLike(
    username: string,
    take: number,
  ): Promise<PublicUserDTO[]> {
    try {
      // if query is ro, it will look for all username starting with ro, Ro, rO or RO
      const user = await this.repo.find({
        where: { username: ILike(`${username}%`) },
        take: take,
      });
      //masking user fields for safety
      const maskedUser = user.map((user) =>
        plainToInstance(PublicUserDTO, user, {
          excludeExtraneousValues: true,
        }),
      );
      return maskedUser;
    } catch {
      throw new InternalServerErrorException(
        'Internal server error. Try again later.',
      );
    }
  }

  // direct search
  async findPublicUserById(id: string): Promise<PublicUserDTO> {
    try {
      const user = await this.repo.findOneBy({ id });
      if (!user) throw new NotFoundException('User not found');
      // returning a masked user
      return plainToInstance(PublicUserDTO, user, {
        excludeExtraneousValues: true,
      });
    } catch {
      throw new InternalServerErrorException(
        'Internal server error. Try again later.',
      );
    }
  }

  async findCompleteUserByEmail(email: string): Promise<UserEntity | null> {
    let user;
    try {
      user = await this.repo.findOneBy({ email });
      return user;
    } catch {
      throw new InternalServerErrorException(
        'Internal server error. Try again later.',
      );
    }
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    Object.assign(user, updateUserDto);
    return await this.repo.save(user);
  }

  async removeUser(id: string): Promise<void> {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    await this.repo.remove(user);
  }

  // For authentication - returns complete UserEntity without masking
  async findCompleteUserById(id: string): Promise<UserEntity | null> {
    try {
      const user = await this.repo.findOneBy({ id });
      return user;
    } catch {
      throw new InternalServerErrorException(
        'Internal server error. Try again later.',
      );
    }
  }

  async updateUserRoleById(id: string, role: UserRole) {
    try {
      await this.repo.update(id, { role: role });
    } catch {
      throw new InternalServerErrorException(
        'Internal server error. Try again later.',
      );
    }
  }
}
