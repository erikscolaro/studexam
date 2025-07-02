import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { ILike } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { PublicUserDTO } from './dto/public-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
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
  async findAllByUsernameLike(query: string): Promise<PublicUserDTO[]> {
    try {
      // if query is ro, it will look for all username starting with ro, Ro, rO or RO
      const user = await this.repo.find({
        where: { username: ILike(`${query}%`) },
        take: 10,
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
  async findOneById(id: string): Promise<PublicUserDTO> {
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

  async validateUserByEmailAndPassword({
    email,
    password,
  }: LoginUserDto): Promise<User> {
    let user;
    try {
      user = await this.repo.findOneBy({ email });
    } catch {
      throw new InternalServerErrorException(
        'Internal server error. Try again later.',
      );
    }

    if (!user || !(await user.verifyPassword(password))) {
      throw new UnauthorizedException('Wrong email or password.');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    Object.assign(user, updateUserDto);
    return await this.repo.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    await this.repo.remove(user);
  }
}
