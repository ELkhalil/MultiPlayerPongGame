import { Module } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { ChatroomController } from './chatroom.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [ChatroomController],
  providers: [ChatroomService, DatabaseService],
})
export class ChatroomModule {}
