import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { MatchmakingService } from './matchmaking.service';

@Module({
  providers: [GameGateway, GameService, MatchmakingService],
})
export class GameModule {}
