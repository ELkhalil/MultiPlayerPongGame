import { GameStatus } from '@prisma/client';

export class UpdateGameDto {
  winner?: { connect: { userId: string } } | null;
  gameStatus?: GameStatus;
  minScore?: number;
  maxScore?: number;
}
