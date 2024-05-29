import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ClientService } from './client.service';
import { MatchmakingService } from './matchmaking.service';
import { ConnectionService } from './connection.service';
export declare class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly connectionService;
    private readonly clientService;
    private readonly matchmakingService;
    private logger;
    private connectedUsers;
    server: Server;
    constructor(connectionService: ConnectionService, clientService: ClientService, matchmakingService: MatchmakingService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleJoinQueue(client: Socket): Promise<void>;
    handleLeaveQueue(client: Socket): Promise<void>;
    handleMovePlayer(client: Socket, { roomId, player, direction }: {
        roomId: any;
        player: any;
        direction: any;
    }): void;
}
