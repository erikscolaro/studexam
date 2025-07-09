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
  @UseGuards(JwtAuthGuardPartialUser, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.MODERATOR, UserRole.PREMIUM])
  async findAll(@Param('id') id: string, @User() user: PublicUserDTO) {
    const res = await this.userService.findUser(
      user.role == UserRole.ADMIN || user.role == UserRole.MODERATOR,
      id,
    );
    return { user: res };
  }

  // find users by partial username, needs protection
  @Get()
  @UseGuards(JwtAuthGuardPartialUser, RolesGuard)
  @Roles([UserRole.ADMIN, UserRole.MODERATOR, UserRole.PREMIUM])
  async find(
    @User() user: PublicUserDTO,
    @Query('username') partialUsername?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    if (!partialUsername || partialUsername.length < 3) return [];
    if (user.role == UserRole.ADMIN || user.role == UserRole.MODERATOR) {
      const users = await this.userService.findUsersByUsernameLike(
        partialUsername,
        true,
        page,
        limit,
      );
      return {
        users,
      };
    } else {
      const users = await this.userService.findUsersByUsernameLike(
        partialUsername,
        false,
        1,
        3,
      );
      return {
        users,
      };
    }
  }

  // update a user, needs protection - solo l'utente stesso può modificare i propri dati
  @Patch(':id')
  @UseGuards(JwtAuthGuardCompleteUser)
  async update(
    @Param('id') id: string,
    @Body('userData') updateUserDto: UpdateUserDto,
    @User() currentUser: PublicUserDTO,
    @Body('role') role?: UserRole,
  ) {
    // Verifica che l'utente possa modificare solo i propri dati
    if (currentUser.id !== id && currentUser.role != UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own profile');
    }
    if (currentUser.role != UserRole.ADMIN && role) {
      throw new ForbiddenException('Only admin users can change the roles!');
    }
    const user = await this.userService.updateUser(id, updateUserDto, role);
    return { user };
  }

  // delete a user, needs protection - solo l'utente stesso può cancellare il proprio account
  @Delete(':id')
  @UseGuards(JwtAuthGuardCompleteUser)
  async remove(@Param('id') id: string, @User() currentUser: PublicUserDTO) {
    // Verifica che l'utente possa cancellare solo il proprio account
    if (currentUser.id !== id) {
      throw new ForbiddenException('You can only delete your own account');
    }
    await this.userService.removeUser(id);
    return;
  }
}
