import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService, DatabaseService],
})
export class MessageModule {}
