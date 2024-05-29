import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { AtGuard } from 'src/auth/Guards/access.guard';
import { GetCurrentUser } from 'src/auth/decorators/getCurrentUser.decorator';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(AtGuard)
  @Post('room/:roomId')
  async create(
    @Param('roomId') roomId: string,
    @Body() createMessageDto: CreateMessageDto,
    @GetCurrentUser('userId') userId: string,
  ) {
    return this.messageService.create(roomId, userId, createMessageDto);
  }

  @UseGuards(AtGuard)
  @Get('room/:roomId')
  // TODO: get limit and offset from query
  async findAll(@Param('roomId') roomId: string, @GetCurrentUser('userId') userId: string){
    return this.messageService.findAll(roomId, userId);
  }
}
