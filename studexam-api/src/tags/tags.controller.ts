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
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { CompleteTagDto } from './dto/complete-tag.dto';
import { JwtAuthGuardPartialUser } from 'src/common/guards/jwt-auth-partial.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/userRoles';
import { User } from 'src/common/decorators/user.decorator';
import { PublicUserDTO } from 'src/users/dto/public-user.dto';
import { plainToInstance } from 'class-transformer';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  // Crea tag - tutti tranne standard user
  @Post()
  @UseGuards(JwtAuthGuardPartialUser, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.MODERATOR, UserRole.PREMIUM])
  create(@Body() createTagDto: CreateTagDto, @User() user: PublicUserDTO) {
    createTagDto.active = true;
    return this.tagsService.create(createTagDto, user.id);
  }

  // Visualizza tutti i tag - Tutti gli utenti autenticati
  @Get()
  @UseGuards(JwtAuthGuardPartialUser, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.MODERATOR, UserRole.PREMIUM])
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') partialName?: string,
    @Query('active') active?: boolean,
  ) {
    return this.tagsService.findAll(page, limit, partialName, active);
  }

  // Visualizza singolo tag
  @Get(':id')
  @UseGuards(JwtAuthGuardPartialUser, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  async findOne(@Param('id') id: string): Promise<CompleteTagDto> {
    const tag = await this.tagsService.findOne(id);
    return plainToInstance(CompleteTagDto, tag, {
      excludeExtraneousValues: true,
    });
  }

  // Modifica tag - Solo admin e moderatori
  @Patch(':id')
  @UseGuards(JwtAuthGuardPartialUser, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(id, updateTagDto);
  }

  // Elimina tag - Solo admin
  @Delete(':id')
  @UseGuards(JwtAuthGuardPartialUser, RolesGuard)
  @Roles([UserRole.ADMIN])
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
