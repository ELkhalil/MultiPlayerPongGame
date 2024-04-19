import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { MatchmakingService } from './matchmaking.service';

@Module({
  providers: [
    GameGateway,
    MatchmakingService,
    {
      provide: GameService,
      useFactory: () => new GameService(800, 500),
    },
  ],
})
export class GameModule {}
