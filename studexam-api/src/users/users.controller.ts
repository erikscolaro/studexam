import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/auth/decorators/user.decorator';
import { PublicUserDTO } from './dto/public-user.dto';
import { JwtAuthGuardPartialUser } from 'src/auth/guards/jwt-auth-partial.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  // regsitration or creation of new user, unprotected
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  // find user by uuid, needs protection
  @Get(':id')
  @UseGuards(JwtAuthGuardPartialUser)
  findAll(@Param('id') id: string) {
    return this.userService.findPublicUserById(id);
  }

  // find users by partial username, needs protection
  @Get()
  @UseGuards(JwtAuthGuardPartialUser)
  findOne(@Query('search') partailUsername: string) {
    if (!partailUsername) return [];
    return this.userService.findPublicUsersByUsernameLike(partailUsername);
  }

  // update a user, needs protection - solo l'utente stesso può modificare i propri dati
  @Patch(':id')
  @UseGuards(JwtAuthGuardPartialUser)
  update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @User() currentUser: PublicUserDTO
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
}
