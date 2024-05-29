import { GameStatus } from '@prisma/client';

export class CreateGameDto {
  player1: { connect: { userId: string } };
  player2: { connect: { userId: string } };
  winner?: { connect: { userId: string } } | null;
  gameStatus: GameStatus;
  minScore: number;
  maxScore: number;
}
