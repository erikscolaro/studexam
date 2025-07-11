import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuardPartialUser } from 'src/common/guards/jwt-auth-partial.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/userRoles';
import { JwtAuthGuardCompleteUser } from 'src/common/guards/jwt-auth-complete.guard';
import { User } from 'src/common/decorators/user.decorator';
import { PublicUserDTO } from 'src/users/dto/public-user.dto';
import { CategoryEntity } from './entities/category.entity';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuardPartialUser, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);
    return { category };
  }

  @Get()
  @UseGuards(JwtAuthGuardPartialUser)
  async findManyByPartialName(
    @Query('search') name: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('root') isRoot: boolean,
    @User() userInfo: PublicUserDTO,
  ) {
    if (!page) page=1;
    if (!limit) limit=10;
    if (limit > 25)
      throw new BadRequestException('Limit should be between 1 and 25.');
    if (page <= 0)
      throw new BadRequestException(
        'Page number must be greater than or equal to 1.',
      );

    let categories: CategoryEntity[] = [];
    if (isRoot) {
      categories = await this.categoriesService.findRootCategories(
        (page - 1) * limit,
        limit
      )
    }
    else if (userInfo.role != UserRole.STANDARD) {
      categories = await this.categoriesService.findManyByPartialName(
        name,
        (page - 1) * limit,
        limit,
      );
    } else {
      categories = await this.categoriesService.findManyByName(
        name,
        (page - 1) * limit,
        limit,
      );
    }

    return { categories };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuardPartialUser)
  async findOne(@Param('id') id: number) {
    const category = await this.categoriesService.findOne(id);
    return { category };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuardCompleteUser, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    return { category };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardCompleteUser, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  async remove(@Param('id') id: number) {
    const category = await this.categoriesService.remove(id);
  }
}
