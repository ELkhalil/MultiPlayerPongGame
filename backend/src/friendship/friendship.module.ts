import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [FriendshipController],
  providers: [FriendshipService, DatabaseService],
})
export class FriendshipModule {}
