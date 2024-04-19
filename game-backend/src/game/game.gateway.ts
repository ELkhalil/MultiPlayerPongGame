import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MatchmakingService } from './matchmaking.service';

@WebSocketGateway({ namespace: 'game' })
export class GameGateway implements OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  constructor(private readonly matchmakingService: MatchmakingService) {}
  handleConnection(client: Socket) {
    this.matchmakingService.setServer(this.server);
  }

  handleDisconnect(client: Socket) {
    this.matchmakingService.handlePlayerDisconnect(client);
  }

  @SubscribeMessage('joinQueue')
  handleJoinQueue(client: Socket) {
    this.matchmakingService.addToQueue(client);
  }

  @SubscribeMessage('movePlayer')
  handlePlayerInput(client: Socket, { roomId, player, direction }) {
    this.matchmakingService.movePlayer(roomId, player, direction);
  }
}
