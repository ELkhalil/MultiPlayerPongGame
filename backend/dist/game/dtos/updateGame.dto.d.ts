import { GameStatus } from '@prisma/client';
export declare class UpdateGameDto {
    winner?: {
        connect: {
            userId: string;
        };
    } | null;
    gameStatus?: GameStatus;
    minScore?: number;
    maxScore?: number;
}
