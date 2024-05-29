'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var GameGateway_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.GameGateway = void 0;
const websockets_1 = require('@nestjs/websockets');
const socket_io_1 = require('socket.io');
const client_service_1 = require('./client.service');
const matchmaking_service_1 = require('./matchmaking.service');
const connection_service_1 = require('./connection.service');
const common_1 = require('@nestjs/common');
const socket_constants_1 = require('./constants/socket.constants');
let GameGateway = (GameGateway_1 = class GameGateway {
  constructor(connectionService, clientService, matchmakingService) {
    this.connectionService = connectionService;
    this.clientService = clientService;
    this.matchmakingService = matchmakingService;
    this.logger = new common_1.Logger(GameGateway_1.name);
    this.connectedUsers = new Set();
  }
  async handleConnection(client) {
    this.logger.warn(`client [${client.id}] attempting to connect...`);
    try {
      const user = await this.clientService.checkClientAccess(client);
      if (user) {
        const isAlreadyHere = this.connectionService.getSocketByUserId(
          user.userId,
        );
        if (isAlreadyHere) {
          client.emit(socket_constants_1.SOCKET_EVENT.CONNECTION_SUCCESS);
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
        client.emit(socket_constants_1.SOCKET_EVENT.CONNECTION_SUCCESS);
        this.logger.log(`client [${client.id}] connected...`);
      } else {
        this.logger.error(`client [${client.id}] failed to connect`);
        client.emit(socket_constants_1.SOCKET_EVENT.CONNECTION_FAILED, {
          message: socket_constants_1.SOCKET_ERROR.CONNECTION_FAILURE_ERR,
        });
        client.disconnect();
      }
    } catch (error) {
      this.logger.error(`client [${client.id}] failed`);
      this.logger.error(`[${client.id}] ${error.message}`);
    }
  }
  async handleDisconnect(client) {
    const userId = this.connectionService.getUserBySocketId(client.id);
    if (userId) {
      await this.matchmakingService.handleDisconnect(userId, client);
      this.connectionService.removeUserSocket(userId);
      this.connectedUsers.delete(userId);
    } else {
      this.logger.error(`client [${client.id}] is not mapped to any user`);
    }
    this.logger.log(`[${client.id}] Disconnected`);
  }
  async handleJoinQueue(client) {
    this.logger.warn(`client [${client.id}] attempting to join Queue...`);
    const userId = this.connectionService.getUserBySocketId(client.id);
    if (userId && this.connectedUsers.has(userId)) {
      await this.matchmakingService.addToQueue(client, userId);
    }
  }
  async handleLeaveQueue(client) {
    this.logger.warn(`client [${client.id}] is leaving Queue...`);
    const userId = this.connectionService.getUserBySocketId(client.id);
    if (userId && this.connectedUsers.has(userId)) {
      return this.matchmakingService.leaveQueue(userId, client);
    } else {
      console.error(`Unauthorized or uninitialized socketId= ${client.id}`);
      client.emit(socket_constants_1.SOCKET_EVENT.UN_INIT_CONNECTION, {
        message: socket_constants_1.SOCKET_ERROR.UN_INIT_CONNECTION_ERR,
      });
    }
  }
  handleMovePlayer(client, { roomId, player, direction }) {
    const userId = this.connectionService.getUserBySocketId(client.id);
    if (userId && this.connectedUsers.has(userId)) {
      this.matchmakingService.movePlayer(roomId, player, direction);
    } else {
      console.error(`Unauthorized or uninitialized socketId= ${client.id}`);
      client.emit(socket_constants_1.SOCKET_EVENT.UN_INIT_CONNECTION, {
        message: socket_constants_1.SOCKET_ERROR.UN_INIT_CONNECTION_ERR,
      });
    }
  }
});
exports.GameGateway = GameGateway;
__decorate(
  [
    (0, websockets_1.WebSocketServer)(),
    __metadata('design:type', socket_io_1.Server),
  ],
  GameGateway.prototype,
  'server',
  void 0,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('joinQueue'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [socket_io_1.Socket]),
    __metadata('design:returntype', Promise),
  ],
  GameGateway.prototype,
  'handleJoinQueue',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('leaveQueue'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [socket_io_1.Socket]),
    __metadata('design:returntype', Promise),
  ],
  GameGateway.prototype,
  'handleLeaveQueue',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('movePlayer'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [socket_io_1.Socket, Object]),
    __metadata('design:returntype', void 0),
  ],
  GameGateway.prototype,
  'handleMovePlayer',
  null,
);
exports.GameGateway =
  GameGateway =
  GameGateway_1 =
    __decorate(
      [
        (0, websockets_1.WebSocketGateway)({ namespace: 'pongGame' }),
        __metadata('design:paramtypes', [
          connection_service_1.ConnectionService,
          client_service_1.ClientService,
          matchmaking_service_1.MatchmakingService,
        ]),
      ],
      GameGateway,
    );
//# sourceMappingURL=game.gateway.js.map
