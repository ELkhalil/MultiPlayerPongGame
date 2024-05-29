import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ConnectionService } from './connection.service';
import { DatabaseService } from 'src/database/database.service';
import { WsException } from '@nestjs/websockets';
import { v4 as uuid } from 'uuid';
import { GameService } from './game.service';
import { ModuleRef } from '@nestjs/core';
import { UserStatus } from './enums/user-status.enum';
import { SOCKET_ERROR, SOCKET_EVENT } from './constants/socket.constants';
import { ERROR } from './constants/errors.messages';

interface RoomData {
  players: string[];
  game: GameService;
}

@Injectable()
export class MatchmakingService {
  private logger: Logger = new Logger(MatchmakingService.name);
  private server: Server;
  private waitingPlayers: string[] = [];
  private runningRooms: Map<string, RoomData> = new Map();
  private matchedPlayersIds: string[] | null = [];

  constructor(
    private readonly connectionService: ConnectionService,
    private readonly database: DatabaseService,
    private readonly moduleRef: ModuleRef,
  ) {}

  setServer(server: Server) {
    this.server = server;
  }

  async addToQueue(player: Socket, playerId: string) {
    player.emit(SOCKET_EVENT.VERIFYING_STATUS);

    const playerStatus = this.connectionService.getUserStatus(playerId);
    if (playerStatus === undefined) {
      this.logger.error(`failed to get [${player.id}] status`);
      throw new WsException(ERROR.USER_NO_STATUS);
    }
    try {
      this.checkPlayerStatus(playerStatus, player);
    } catch (error) {
      this.logger.error(`client [${player.id}] failed ${error.message}`);
      return;
    }

    player.emit(SOCKET_EVENT.STATUS_VERIFIED);
    player.emit(SOCKET_EVENT.UPDATING_USER_STATUS, {
      status: UserStatus.IN_MATCHMAKING,
    });
    this.connectionService.updateUserStatus(
      playerId,
      UserStatus.IN_MATCHMAKING,
    );

    player.emit(SOCKET_EVENT.USER_IN_QUEUE);
    this.waitingPlayers.push(playerId);

    if (this.waitingPlayers.length >= 2) {
      const playersToMatch = this.waitingPlayers.splice(0, 2);
      this.matchedPlayersIds = playersToMatch;

      const [player1Id, player2Id] = playersToMatch;

      const player1Socket = this.connectionService.getSocketByUserId(player1Id);
      const player2Socket = this.connectionService.getSocketByUserId(player2Id);

      const player1Data = await this.database.user.findUnique({
        where: {
          userId: player1Id,
        },
        select: {
          username: true,
          firstName: true,
          lastName: true,
        },
      });

      const player2Data = await this.database.user.findUnique({
        where: {
          userId: player2Id,
        },
        select: {
          username: true,
          firstName: true,
          lastName: true,
        },
      });

      if (player1Socket && player2Socket) {
        this.connectionService.updateUserStatus(player1Id, UserStatus.MATCHED);
        this.connectionService.updateUserStatus(player2Id, UserStatus.MATCHED);

        player1Socket.emit(SOCKET_EVENT.UPDATING_USER_STATUS, {
          status: UserStatus.WAITING_GAME,
        });
        player2Socket.emit(SOCKET_EVENT.UPDATING_USER_STATUS, {
          status: UserStatus.WAITING_GAME,
        });

        player1Socket.emit(SOCKET_EVENT.USER_MATCHED, {
          opponentId: player2Id,
          opponentUserName: player2Data.username,
        });
        player2Socket.emit(SOCKET_EVENT.USER_MATCHED, {
          opponentId: player1Id,
          opponentUserName: player1Data.username,
        });

        this.connectionService.updateUserStatus(
          player1Id,
          UserStatus.WAITING_GAME,
        );
        this.connectionService.updateUserStatus(
          player2Id,
          UserStatus.WAITING_GAME,
        );

        setTimeout(() => {
          if (this.matchedPlayersIds) {
            this.matchPlayers();
          }
        }, 2000);
      } else {
        throw new WsException(ERROR.SOCKET_NOT_FOUND);
      }
    } else {
      player.emit(SOCKET_EVENT.USER_QUEUE_UPDATE, {
        queueStatus: this.waitingPlayers.length,
      });
      this.logger.log(`${this.waitingPlayers.length} player(s) in Queue`);
    }
  }

  async handleDisconnect(userId: string, client: Socket) {
    try {
      const userStatus = this.connectionService.getUserStatus(userId);
      if (userStatus === undefined) {
        this.logger.error(ERROR.USER_NO_STATUS);
        return;
      }
      switch (userStatus) {
        case UserStatus.ONLINE:
          this.logger.verbose(
            `User ${userId} Disconnected as ${UserStatus[userStatus]}`,
          );
          break;
        case UserStatus.FINISHED_GAME:
          this.handleGameFinish(userId);
          break;
        case UserStatus.IN_MATCHMAKING:
          this.logger.warn(`User ${userId} disconnected from matchmaking`);
          this.leaveQueue(userId, client);
          break;
        case UserStatus.MATCHED:
        case UserStatus.WAITING_GAME:
        case UserStatus.COUNTDOWN:
        case UserStatus.IN_GAME:
          this.logger.warn(
            `User ${userId} Disconnected status: ${UserStatus[userStatus]}`,
          );
          this.handleMatchDisconnection(userId);
          break;
        default:
          this.logger.error('Unhandled user status:', userStatus);
      }
    } catch (error) {
      this.logger.error('An error occurred:', error);
    }
  }

  leaveQueue(userId: string, client: Socket) {
    const userStatus = this.connectionService.getUserStatus(userId);
    if (userStatus === undefined) {
      console.error('user status undefined');
    } else if (userStatus !== UserStatus.IN_MATCHMAKING) {
      const getSocketId = this.connectionService.getSocketByUserId(userId);
      if (getSocketId) {
        getSocketId.disconnect();
      }
    } else {
      try {
        this.waitingPlayers = this.waitingPlayers.filter((id) => id !== userId);
        this.connectionService.updateUserStatus(userId, UserStatus.ONLINE);
        client.disconnect();
        this.logger.log(
          `User [${userId}] left the queue, status updated to ONLINE`,
        );
      } catch (error) {
        console.error(error.error);
      }
    }
  }

  movePlayer(roomId: string, player: number, direction: 'up' | 'down') {
    const roomData = this.runningRooms.get(roomId);
    if (roomData) {
      const game = roomData.game;
      game.handlePlayerMovement(player, direction);
    }
  }

  /* Private helper Methods */
  private emitErrorMessage(client: Socket, event: string, msg: string) {
    client.emit(event, { message: msg });
    client.disconnect();
  }

  private manageRunningRoom(roomId: string) {
    const room = this.runningRooms.get(roomId);
    if (room) {
      this.matchedPlayersIds = null;
      const game = room.game;
      const gameState = game.getGameState();
      this.server.to(roomId).emit(SOCKET_EVENT.STARTING_GAME, gameState);
      room.players.map((playerId) => {
        this.connectionService.updateUserStatus(playerId, UserStatus.COUNTDOWN);
      });

      setTimeout(() => {
        game.startGame();
        room.players.map((playerId) => {
          this.connectionService.updateUserStatus(playerId, UserStatus.IN_GAME);
        });
      }, 5000);
    } else {
      console.log('here');
      this.server.to(roomId).emit(SOCKET_EVENT.NOT_ENOUGH_PLAYERS, {
        reason: SOCKET_ERROR.NOT_ENOUGH_PLAYERS_ERR,
      });
      this.runningRooms.delete(roomId);
    }
  }

  private async matchPlayers() {
    let allPlayersConnected = true;
    const players = this.matchedPlayersIds;

    if (players && players.length >= 2) {
      const roomId = uuid();
      const game = await this.moduleRef.create(GameService);
      game.setServer(this.server, roomId, players);
      const initGameState = game.getGameState();
      this.runningRooms.set(roomId, { players, game });

      players.forEach((player, index) => {
        const socket = this.connectionService.getSocketByUserId(player);
        if (socket) {
          socket.join(roomId);
          socket.emit(SOCKET_EVENT.INIT_GAME, {
            roomId,
            playerPos: index + 1,
            initGameState,
          });
        } else {
          allPlayersConnected = false;
        }
      });
      if (allPlayersConnected) {
        this.manageRunningRoom(roomId);
      }
    }
  }

  private checkPlayerStatus(playerStatus: UserStatus, player: Socket) {
    if (playerStatus === undefined) {
      this.emitErrorMessage(
        player,
        SOCKET_EVENT.STATUS_NOT_FOUND,
        SOCKET_ERROR.STATUS_NOT_FOUND_ERR,
      );
      throw new WsException(ERROR.USER_NO_STATUS);
    }
    if (playerStatus === UserStatus.IN_MATCHMAKING) {
      this.emitErrorMessage(
        player,
        SOCKET_EVENT.USER_IN_MATCHMAKING,
        SOCKET_ERROR.DUP_MATCHMAKING_ERR,
      );
      throw new WsException(ERROR.USER_DUP_MATCHMAKING);
    }
    if (playerStatus === UserStatus.WAITING_GAME) {
      this.emitErrorMessage(
        player,
        SOCKET_EVENT.USER_WAITING_GAME,
        SOCKET_ERROR.DUP_WAITING_GAME_ERR,
      );
      throw new WsException(ERROR.USER_DUP_IN_GAME);
    }
    if (playerStatus === UserStatus.COUNTDOWN) {
      this.emitErrorMessage(
        player,
        SOCKET_EVENT.USER_IN_COUNTDOWN,
        SOCKET_ERROR.DUP_COUNTDOWN,
      );
      throw new WsException(ERROR.USER_DUP_COUNTDOWN);
    }
    if (playerStatus === UserStatus.IN_GAME) {
      this.emitErrorMessage(
        player,
        SOCKET_EVENT.USER_IN_GAME,
        SOCKET_ERROR.DUP_IN_GAME,
      );
      throw new WsException(ERROR.USER_DUP_GAME);
    }
  }

  private handleGameFinish(userId: string) {
    this.matchedPlayersIds = null;
    const roomId = this.findRoomByPlayerId(userId);
    if (roomId) {
      this.runningRooms.delete(roomId);
    }
  }

  async handleMatchDisconnection(userId: string) {
    const roomId = this.findRoomByPlayerId(userId);
    if (roomId) {
      const roomData = this.runningRooms.get(roomId);
      if (roomData) {
        if (roomData.game.isGameStarted) {
          roomData.game.pauseGameExecution();
          const opponentId = roomData.players.find(
            (player) => player !== userId,
          );
          roomData.game.setWinner(opponentId);
          await roomData.game.endGame();
          this.matchedPlayersIds = null;
          this.runningRooms.delete(roomId);
          return;
        }
        roomData.game.setIsCancelledGame();
        const opponentId = roomData.players.find((player) => player !== userId);
        if (opponentId) {
          const opponentSocket =
            this.connectionService.getSocketByUserId(opponentId);
          this.connectionService.updateUserStatus(
            opponentId,
            UserStatus.ONLINE,
          );
          if (opponentSocket) {
            opponentSocket.emit(SOCKET_EVENT.OPPONENT_DISCONNECT, {
              message: SOCKET_ERROR.OPPONENT_DISCONNECT,
            });
          }
        }
        this.connectionService.updateUserStatus(userId, UserStatus.ONLINE);
        this.matchedPlayersIds = null;
        this.runningRooms.delete(roomId);
        return;
      }
    } else {
      if (!this.matchedPlayersIds) {
        return;
      }
      const livePlayerSocket = this.extractLiveUser(
        this.matchedPlayersIds,
        userId,
      );
      if (livePlayerSocket) {
        livePlayerSocket.emit(SOCKET_EVENT.MATCH_CANCELLED, {
          message: SOCKET_ERROR.OPPONENT_DISCONNECT,
        });
      }
      this.matchedPlayersIds = null;
    }
  }

  private extractLiveUser(players: string[], userId: string) {
    if (!players) {
      return;
    }
    const [player1Id, player2Id] = players;
    let livePlayerSocket: Socket;
    if (player1Id !== userId) {
      livePlayerSocket = this.connectionService.getSocketByUserId(player1Id);
    } else {
      livePlayerSocket = this.connectionService.getSocketByUserId(player2Id);
    }
    return livePlayerSocket;
  }

  private findRoomByPlayerId(playerId: string): string | null {
    for (const [roomId, roomData] of this.runningRooms.entries()) {
      if (roomData.players.includes(playerId)) {
        return roomId;
      }
    }
    return null;
  }
}
