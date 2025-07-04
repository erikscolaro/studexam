import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ForbiddenException,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/common/decorators/user.decorator';
import { PublicUserDTO } from './dto/public-user.dto';
import { JwtAuthGuardPartialUser } from 'src/common/guards/jwt-auth-partial.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { UserRole } from 'src/common/userRoles';
import { JwtAuthGuardCompleteUser } from 'src/common/guards/jwt-auth-complete.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  // find user by uuid, needs protection
  @Get(':id')
  @UseGuards(JwtAuthGuardPartialUser)
  async findAll(@Param('id') id: string): Promise<PublicUserDTO> {
    return await this.userService.findPublicUserById(id);
  }

  // find users by partial username, needs protection
  @Get()
  @UseGuards(JwtAuthGuardPartialUser, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.MODERATOR, UserRole.PREMIUM])
  findOne(@Query('search') partailUsername: string) {
    if (!partailUsername) return [];
    return this.userService.findPublicUsersByUsernameLike(partailUsername, 3);
  }

  // update a user, needs protection - solo l'utente stesso può modificare i propri dati
  @Patch(':id')
  @UseGuards(JwtAuthGuardPartialUser)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() currentUser: PublicUserDTO,
  ) {
    // Verifica che l'utente possa modificare solo i propri dati
    if (currentUser.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.userService.updateUser(id, updateUserDto);
  }

  // delete a user, needs protection - solo l'utente stesso può cancellare il proprio account
  @Delete(':id')
  @UseGuards(JwtAuthGuardPartialUser)
  remove(@Param('id') id: string, @User() currentUser: PublicUserDTO) {
    // Verifica che l'utente possa cancellare solo il proprio account
    if (currentUser.id !== id) {
      throw new ForbiddenException('You can only delete your own account');
    }
    return this.userService.removeUser(id);
  }

  @Patch(':id/role')
  @HttpCode(200)
  @UseGuards(JwtAuthGuardCompleteUser, RolesGuard)
  @Roles([UserRole.ADMIN])
  modifyRole(@Param('id') id: string, @Body('role') role: UserRole) {
    this.userService.updateUserRoleById(id, role);
  }
}
