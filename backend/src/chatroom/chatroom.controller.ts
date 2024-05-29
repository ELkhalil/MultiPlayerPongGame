import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { CreateChatroomDto } from './dto/create-chatroom.dto';
import { UpdateChatroomDto } from './dto/update-chatroom.dto';
import { ApiCookieAuth } from '@nestjs/swagger';
import { AtGuard } from 'src/auth/Guards/access.guard';
import { GetCurrentUser } from 'src/auth/decorators/getCurrentUser.decorator';

@ApiCookieAuth('access_token')
@Controller('chatroom')
export class ChatroomController {
  constructor(private readonly chatroomService: ChatroomService) {}

  @UseGuards(AtGuard)
  @Post('create')
  async create(
    @Body() createChatroomDto: CreateChatroomDto,
    @GetCurrentUser('userId') userOwner: string,
  ) {
    return this.chatroomService.create(createChatroomDto, userOwner);
  }

  @UseGuards(AtGuard)
  @Get('getAllRooms')
  async getChatrooms(@GetCurrentUser('userId') userId: string) {
    return this.chatroomService.getChatrooms(userId);
  }
}
