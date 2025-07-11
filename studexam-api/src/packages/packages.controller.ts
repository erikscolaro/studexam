import { Controller, Get, Post, Body, Param, Query, UseGuards, ClassSerializerInterceptor, UseInterceptors, NotFoundException } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { SearchPackagesDto } from './dto/search-packages.dto';
import { PublicPackageDto } from './dto/public-package.dto';
import { JwtAuthGuardCompleteUser } from '../auth/guards/jwt-auth-complete.guard';
import { JwtAuthGuardPartialUser } from '../auth/guards/jwt-auth-partial.guard';
import { User } from '../auth/decorators/user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { plainToClass } from 'class-transformer';

@Controller('packages')
@UseInterceptors(ClassSerializerInterceptor)
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  @UseGuards(JwtAuthGuardCompleteUser)
  async create(
    @Body() createPackageDto: CreatePackageDto,
    @User() user: UserEntity
  ): Promise<PublicPackageDto> {
    const packageEntity = await this.packagesService.create(createPackageDto, user.id);
    return plainToClass(PublicPackageDto, packageEntity, { excludeExtraneousValues: true });
  }

  @Get('search')
  @UseGuards(JwtAuthGuardPartialUser)
  async search(@Query() searchDto: SearchPackagesDto): Promise<PublicPackageDto[]> {
    const packages = await this.packagesService.search(searchDto);
    return packages.map(pkg => plainToClass(PublicPackageDto, pkg, { excludeExtraneousValues: true }));
  }

  @Get()
  @UseGuards(JwtAuthGuardPartialUser)
  async findAll(): Promise<PublicPackageDto[]> {
    const packages = await this.packagesService.findAll();
    return packages.map(pkg => plainToClass(PublicPackageDto, pkg, { excludeExtraneousValues: true }));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuardPartialUser)
  async findOne(@Param('id') id: string): Promise<PublicPackageDto> {
    const packageEntity = await this.packagesService.findOne(id);
    if (!packageEntity) {
      throw new NotFoundException('Package not found');
    }
    return plainToClass(PublicPackageDto, packageEntity, { excludeExtraneousValues: true });
  }
}