import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ClientService } from './client.service';
import { MatchmakingService } from './matchmaking.service';
import { ConnectionService } from './connection.service';
import { Logger } from '@nestjs/common';
import { SOCKET_ERROR, SOCKET_EVENT } from './constants/socket.constants';

@WebSocketGateway({ namespace: 'pongGame' })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger(GameGateway.name);
  private connectedUsers: Set<string> = new Set();

  @WebSocketServer()
  server: Server;
  constructor(
    private readonly connectionService: ConnectionService,
    private readonly clientService: ClientService,
    private readonly matchmakingService: MatchmakingService,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.warn(`client [${client.id}] attempting to connect...`);
    try {
      const user = await this.clientService.checkClientAccess(client);
      if (user) {
        const isAlreadyHere = this.connectionService.getSocketByUserId(
          user.userId,
        );
        if (isAlreadyHere) {
          client.emit(SOCKET_EVENT.CONNECTION_SUCCESS);
          this.logger.log(`client [${client.id}] connected...`);
          try {
            await this.matchmakingService.addToQueue(client, user.userId);
          } catch (error) {
            console.error(error.error);
          }
          return;
        }
        this.connectionService.addUserSocket(user.userId, client);
        this.matchmakingService.setServer(this.server);
        this.connectedUsers.add(user.userId);
        client.emit(SOCKET_EVENT.CONNECTION_SUCCESS);
        this.logger.log(`client [${client.id}] connected...`);
      } else {
        this.logger.error(`client [${client.id}] failed to connect`);
        client.emit(SOCKET_EVENT.CONNECTION_FAILED, {
          message: SOCKET_ERROR.CONNECTION_FAILURE_ERR,
        });
        client.disconnect();
      }
    } catch (error) {
      this.logger.error(`client [${client.id}] failed`);
      this.logger.error(`[${client.id}] ${error.message}`);
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.connectionService.getUserBySocketId(client.id);
    if (userId) {
      await this.matchmakingService.handleDisconnect(userId, client);
      this.connectionService.removeUserSocket(userId);
      this.connectedUsers.delete(userId);
      this.connectionService.dataLogger();
    } else {
      this.logger.error(`client [${client.id}] is not mapped to any user`);
    }
    this.logger.log(`[${client.id}] Disconnected`);
  }

  @SubscribeMessage('joinQueue')
  async handleJoinQueue(client: Socket) {
    this.logger.warn(`client [${client.id}] attempting to join Queue...`);
    const userId = this.connectionService.getUserBySocketId(client.id);
    if (userId && this.connectedUsers.has(userId)) {
      await this.matchmakingService.addToQueue(client, userId);
    }
  }

  @SubscribeMessage('leaveQueue')
  async handleLeaveQueue(client: Socket) {
    this.logger.warn(`client [${client.id}] is leaving Queue...`);
    const userId = this.connectionService.getUserBySocketId(client.id);
    if (userId && this.connectedUsers.has(userId)) {
      return this.matchmakingService.leaveQueue(userId, client);
    } else {
      console.error(`Unauthorized or uninitialized socketId= ${client.id}`);
      client.emit(SOCKET_EVENT.UN_INIT_CONNECTION, {
        message: SOCKET_ERROR.UN_INIT_CONNECTION_ERR,
      });
    }
  }

  @SubscribeMessage('movePlayer')
  handleMovePlayer(client: Socket, { roomId, player, direction }) {
    const userId = this.connectionService.getUserBySocketId(client.id);
    if (userId && this.connectedUsers.has(userId)) {
      this.matchmakingService.movePlayer(roomId, player, direction);
    } else {
      console.error(`Unauthorized or uninitialized socketId= ${client.id}`);
      client.emit(SOCKET_EVENT.UN_INIT_CONNECTION, {
        message: SOCKET_ERROR.UN_INIT_CONNECTION_ERR,
      });
    }
  }
}
