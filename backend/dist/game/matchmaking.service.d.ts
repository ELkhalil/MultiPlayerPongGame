import { Server, Socket } from 'socket.io';
import { ConnectionService } from './connection.service';
import { DatabaseService } from 'src/database/database.service';
import { ModuleRef } from '@nestjs/core';
export declare class MatchmakingService {
    private readonly connectionService;
    private readonly database;
    private readonly moduleRef;
    private logger;
    private server;
    private waitingPlayers;
    private runningRooms;
    private matchedPlayersIds;
    constructor(connectionService: ConnectionService, database: DatabaseService, moduleRef: ModuleRef);
    setServer(server: Server): void;
    addToQueue(player: Socket, playerId: string): Promise<void>;
    handleDisconnect(userId: string, client: Socket): Promise<void>;
    leaveQueue(userId: string, client: Socket): void;
    movePlayer(roomId: string, player: number, direction: 'up' | 'down'): void;
    private emitErrorMessage;
    private manageRunningRoom;
    private matchPlayers;
    private checkPlayerStatus;
    private handleGameFinish;
    handleMatchDisconnection(userId: string): Promise<void>;
    private extractLiveUser;
    private findRoomByPlayerId;
}
