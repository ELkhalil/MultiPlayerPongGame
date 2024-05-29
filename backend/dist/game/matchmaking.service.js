"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MatchmakingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchmakingService = void 0;
const common_1 = require("@nestjs/common");
const connection_service_1 = require("./connection.service");
const database_service_1 = require("../database/database.service");
const websockets_1 = require("@nestjs/websockets");
const uuid_1 = require("uuid");
const game_service_1 = require("./game.service");
const core_1 = require("@nestjs/core");
const user_status_enum_1 = require("./enums/user-status.enum");
const socket_constants_1 = require("./constants/socket.constants");
const errors_messages_1 = require("./constants/errors.messages");
let MatchmakingService = MatchmakingService_1 = class MatchmakingService {
    constructor(connectionService, database, moduleRef) {
        this.connectionService = connectionService;
        this.database = database;
        this.moduleRef = moduleRef;
        this.logger = new common_1.Logger(MatchmakingService_1.name);
        this.waitingPlayers = [];
        this.runningRooms = new Map();
        this.matchedPlayersIds = [];
    }
    setServer(server) {
        this.server = server;
    }
    async addToQueue(player, playerId) {
        player.emit(socket_constants_1.SOCKET_EVENT.VERIFYING_STATUS);
        const playerStatus = this.connectionService.getUserStatus(playerId);
        if (playerStatus === undefined) {
            this.logger.error(`failed to get [${player.id}] status`);
            throw new websockets_1.WsException(errors_messages_1.ERROR.USER_NO_STATUS);
        }
        try {
            this.checkPlayerStatus(playerStatus, player);
        }
        catch (error) {
            this.logger.error(`client [${player.id}] failed ${error.message}`);
            return;
        }
        player.emit(socket_constants_1.SOCKET_EVENT.STATUS_VERIFIED);
        player.emit(socket_constants_1.SOCKET_EVENT.UPDATING_USER_STATUS, {
            status: user_status_enum_1.UserStatus.IN_MATCHMAKING,
        });
        this.connectionService.updateUserStatus(playerId, user_status_enum_1.UserStatus.IN_MATCHMAKING);
        player.emit(socket_constants_1.SOCKET_EVENT.USER_IN_QUEUE);
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
                this.connectionService.updateUserStatus(player1Id, user_status_enum_1.UserStatus.MATCHED);
                this.connectionService.updateUserStatus(player2Id, user_status_enum_1.UserStatus.MATCHED);
                player1Socket.emit(socket_constants_1.SOCKET_EVENT.UPDATING_USER_STATUS, {
                    status: user_status_enum_1.UserStatus.WAITING_GAME,
                });
                player2Socket.emit(socket_constants_1.SOCKET_EVENT.UPDATING_USER_STATUS, {
                    status: user_status_enum_1.UserStatus.WAITING_GAME,
                });
                player1Socket.emit(socket_constants_1.SOCKET_EVENT.USER_MATCHED, {
                    opponentId: player2Id,
                    opponentUserName: player2Data.username,
                });
                player2Socket.emit(socket_constants_1.SOCKET_EVENT.USER_MATCHED, {
                    opponentId: player1Id,
                    opponentUserName: player1Data.username,
                });
                this.connectionService.updateUserStatus(player1Id, user_status_enum_1.UserStatus.WAITING_GAME);
                this.connectionService.updateUserStatus(player2Id, user_status_enum_1.UserStatus.WAITING_GAME);
                setTimeout(() => {
                    if (this.matchedPlayersIds) {
                        this.matchPlayers();
                    }
                }, 2000);
            }
            else {
                throw new websockets_1.WsException(errors_messages_1.ERROR.SOCKET_NOT_FOUND);
            }
        }
        else {
            player.emit(socket_constants_1.SOCKET_EVENT.USER_QUEUE_UPDATE, {
                queueStatus: this.waitingPlayers.length,
            });
            this.logger.log(`${this.waitingPlayers.length} player(s) in Queue`);
        }
    }
    async handleDisconnect(userId, client) {
        try {
            const userStatus = this.connectionService.getUserStatus(userId);
            if (userStatus === undefined) {
                this.logger.error(errors_messages_1.ERROR.USER_NO_STATUS);
                return;
            }
            switch (userStatus) {
                case user_status_enum_1.UserStatus.ONLINE:
                    this.logger.verbose(`User ${userId} Disconnected as ${user_status_enum_1.UserStatus[userStatus]}`);
                    break;
                case user_status_enum_1.UserStatus.FINISHED_GAME:
                    this.handleGameFinish(userId);
                    break;
                case user_status_enum_1.UserStatus.IN_MATCHMAKING:
                    this.logger.warn(`User ${userId} disconnected from matchmaking`);
                    this.leaveQueue(userId, client);
                    break;
                case user_status_enum_1.UserStatus.MATCHED:
                case user_status_enum_1.UserStatus.WAITING_GAME:
                case user_status_enum_1.UserStatus.COUNTDOWN:
                case user_status_enum_1.UserStatus.IN_GAME:
                    this.logger.warn(`User ${userId} Disconnected status: ${user_status_enum_1.UserStatus[userStatus]}`);
                    this.handleMatchDisconnection(userId);
                    break;
                default:
                    this.logger.error('Unhandled user status:', userStatus);
            }
        }
        catch (error) {
            this.logger.error('An error occurred:', error);
        }
    }
    leaveQueue(userId, client) {
        const userStatus = this.connectionService.getUserStatus(userId);
        if (userStatus === undefined) {
            console.error('user status undefined');
        }
        else if (userStatus !== user_status_enum_1.UserStatus.IN_MATCHMAKING) {
            const getSocketId = this.connectionService.getSocketByUserId(userId);
            if (getSocketId) {
                getSocketId.disconnect();
            }
        }
        else {
            try {
                this.waitingPlayers = this.waitingPlayers.filter((id) => id !== userId);
                this.connectionService.updateUserStatus(userId, user_status_enum_1.UserStatus.ONLINE);
                client.disconnect();
                this.logger.log(`User [${userId}] left the queue, status updated to ONLINE`);
            }
            catch (error) {
                console.error(error.error);
            }
        }
    }
    movePlayer(roomId, player, direction) {
        const roomData = this.runningRooms.get(roomId);
        if (roomData) {
            const game = roomData.game;
            game.handlePlayerMovement(player, direction);
        }
    }
    emitErrorMessage(client, event, msg) {
        client.emit(event, { message: msg });
        client.disconnect();
    }
    manageRunningRoom(roomId) {
        const room = this.runningRooms.get(roomId);
        if (room) {
            this.matchedPlayersIds = null;
            const game = room.game;
            const gameState = game.getGameState();
            this.server.to(roomId).emit(socket_constants_1.SOCKET_EVENT.STARTING_GAME, gameState);
            room.players.map((playerId) => {
                this.connectionService.updateUserStatus(playerId, user_status_enum_1.UserStatus.COUNTDOWN);
            });
            setTimeout(() => {
                game.startGame();
                room.players.map((playerId) => {
                    this.connectionService.updateUserStatus(playerId, user_status_enum_1.UserStatus.IN_GAME);
                });
            }, 5000);
        }
        else {
            console.log('here');
            this.server.to(roomId).emit(socket_constants_1.SOCKET_EVENT.NOT_ENOUGH_PLAYERS, {
                reason: socket_constants_1.SOCKET_ERROR.NOT_ENOUGH_PLAYERS_ERR,
            });
            this.runningRooms.delete(roomId);
        }
    }
    async matchPlayers() {
        let allPlayersConnected = true;
        const players = this.matchedPlayersIds;
        if (players && players.length >= 2) {
            const roomId = (0, uuid_1.v4)();
            const game = await this.moduleRef.create(game_service_1.GameService);
            game.setServer(this.server, roomId, players);
            const initGameState = game.getGameState();
            this.runningRooms.set(roomId, { players, game });
            players.forEach((player, index) => {
                const socket = this.connectionService.getSocketByUserId(player);
                if (socket) {
                    socket.join(roomId);
                    socket.emit(socket_constants_1.SOCKET_EVENT.INIT_GAME, {
                        roomId,
                        playerPos: index + 1,
                        initGameState,
                    });
                }
                else {
                    allPlayersConnected = false;
                }
            });
            if (allPlayersConnected) {
                this.manageRunningRoom(roomId);
            }
        }
    }
    checkPlayerStatus(playerStatus, player) {
        if (playerStatus === undefined) {
            this.emitErrorMessage(player, socket_constants_1.SOCKET_EVENT.STATUS_NOT_FOUND, socket_constants_1.SOCKET_ERROR.STATUS_NOT_FOUND_ERR);
            throw new websockets_1.WsException(errors_messages_1.ERROR.USER_NO_STATUS);
        }
        if (playerStatus === user_status_enum_1.UserStatus.IN_MATCHMAKING) {
            this.emitErrorMessage(player, socket_constants_1.SOCKET_EVENT.USER_IN_MATCHMAKING, socket_constants_1.SOCKET_ERROR.DUP_MATCHMAKING_ERR);
            throw new websockets_1.WsException(errors_messages_1.ERROR.USER_DUP_MATCHMAKING);
        }
        if (playerStatus === user_status_enum_1.UserStatus.WAITING_GAME) {
            this.emitErrorMessage(player, socket_constants_1.SOCKET_EVENT.USER_WAITING_GAME, socket_constants_1.SOCKET_ERROR.DUP_WAITING_GAME_ERR);
            throw new websockets_1.WsException(errors_messages_1.ERROR.USER_DUP_IN_GAME);
        }
        if (playerStatus === user_status_enum_1.UserStatus.COUNTDOWN) {
            this.emitErrorMessage(player, socket_constants_1.SOCKET_EVENT.USER_IN_COUNTDOWN, socket_constants_1.SOCKET_ERROR.DUP_COUNTDOWN);
            throw new websockets_1.WsException(errors_messages_1.ERROR.USER_DUP_COUNTDOWN);
        }
        if (playerStatus === user_status_enum_1.UserStatus.IN_GAME) {
            this.emitErrorMessage(player, socket_constants_1.SOCKET_EVENT.USER_IN_GAME, socket_constants_1.SOCKET_ERROR.DUP_IN_GAME);
            throw new websockets_1.WsException(errors_messages_1.ERROR.USER_DUP_GAME);
        }
    }
    handleGameFinish(userId) {
        this.matchedPlayersIds = null;
        const roomId = this.findRoomByPlayerId(userId);
        if (roomId) {
            this.runningRooms.delete(roomId);
        }
    }
    async handleMatchDisconnection(userId) {
        const roomId = this.findRoomByPlayerId(userId);
        if (roomId) {
            const roomData = this.runningRooms.get(roomId);
            if (roomData) {
                if (roomData.game.isGameStarted) {
                    roomData.game.pauseGameExecution();
                    const opponentId = roomData.players.find((player) => player !== userId);
                    roomData.game.setWinner(opponentId);
                    await roomData.game.endGame();
                    this.matchedPlayersIds = null;
                    this.runningRooms.delete(roomId);
                    return;
                }
                roomData.game.setIsCancelledGame();
                const opponentId = roomData.players.find((player) => player !== userId);
                if (opponentId) {
                    const opponentSocket = this.connectionService.getSocketByUserId(opponentId);
                    this.connectionService.updateUserStatus(opponentId, user_status_enum_1.UserStatus.ONLINE);
                    if (opponentSocket) {
                        opponentSocket.emit(socket_constants_1.SOCKET_EVENT.OPPONENT_DISCONNECT, {
                            message: socket_constants_1.SOCKET_ERROR.OPPONENT_DISCONNECT,
                        });
                    }
                }
                this.connectionService.updateUserStatus(userId, user_status_enum_1.UserStatus.ONLINE);
                this.matchedPlayersIds = null;
                this.runningRooms.delete(roomId);
                return;
            }
        }
        else {
            if (!this.matchedPlayersIds) {
                return;
            }
            const livePlayerSocket = this.extractLiveUser(this.matchedPlayersIds, userId);
            if (livePlayerSocket) {
                livePlayerSocket.emit(socket_constants_1.SOCKET_EVENT.MATCH_CANCELLED, {
                    message: socket_constants_1.SOCKET_ERROR.OPPONENT_DISCONNECT,
                });
            }
            this.matchedPlayersIds = null;
        }
    }
    extractLiveUser(players, userId) {
        if (!players) {
            return;
        }
        const [player1Id, player2Id] = players;
        let livePlayerSocket;
        if (player1Id !== userId) {
            livePlayerSocket = this.connectionService.getSocketByUserId(player1Id);
        }
        else {
            livePlayerSocket = this.connectionService.getSocketByUserId(player2Id);
        }
        return livePlayerSocket;
    }
    findRoomByPlayerId(playerId) {
        for (const [roomId, roomData] of this.runningRooms.entries()) {
            if (roomData.players.includes(playerId)) {
                return roomId;
            }
        }
        return null;
    }
};
exports.MatchmakingService = MatchmakingService;
exports.MatchmakingService = MatchmakingService = MatchmakingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [connection_service_1.ConnectionService,
        database_service_1.DatabaseService,
        core_1.ModuleRef])
], MatchmakingService);
//# sourceMappingURL=matchmaking.service.js.map