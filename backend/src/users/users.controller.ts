import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { usersSearchDto } from './dto/search-user.dto';
import { AtGuard } from 'src/auth/Guards/access.guard';
import { GetCurrentUser } from 'src/auth/decorators/getCurrentUser.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  @UseGuards(AtGuard)
  async GetSearchedUsers(
    @Query() query: usersSearchDto,
    @GetCurrentUser('userId') userId: string,
  ) {
    console.log(query);
    return this.usersService.GetSearchedUsers(query.name, userId);
  }

  @UseGuards(AtGuard)
  @Get()
  async whoami(@GetCurrentUser('userId') userId: string) {
    return this.usersService.getUserById(userId);
  }

  @UseGuards(AtGuard)
  @Post('update')
  async update(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    const result = this.usersService.update(req.user.userId, updateUserDto);
    if (result) {
      return { message: 'User updated successfully' };
    }
    return { message: 'User update failed' };
  }

  @UseGuards(AtGuard)
  @Post('update/password')
  async updatePassword(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const result = this.usersService.updatePassword(
      req.user.userId,
      updateUserDto.password,
    );
    if (result) {
      return { message: 'Password updated successfully' };
    }
    return { message: 'Password update failed' };
  }
}
