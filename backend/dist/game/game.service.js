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
var GameService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const Ball_entity_1 = require("./entities/Ball.entity");
const Player_entity_1 = require("./entities/Player.entity");
const database_service_1 = require("../database/database.service");
const client_1 = require("@prisma/client");
const connection_service_1 = require("./connection.service");
const user_status_enum_1 = require("./enums/user-status.enum");
const socket_constants_1 = require("./constants/socket.constants");
const game_settings_1 = require("./constants/game.settings");
let GameService = GameService_1 = class GameService {
    constructor(database, connectionService) {
        this.database = database;
        this.connectionService = connectionService;
        this.logger = new common_1.Logger(GameService_1.name);
        this.width = game_settings_1.GAME_SETTINGS.GAME_WIDTH;
        this.height = game_settings_1.GAME_SETTINGS.GAME_HEIGHT;
        this.framePerSeconds = game_settings_1.GAME_SETTINGS.FRAME_PER_SECONDS;
        this.loop = null;
        this.target = game_settings_1.GAME_SETTINGS.GAME_TARGET;
        this.leftPlayer = null;
        this.rightPlayer = null;
        this.ball = null;
        this.gameId = null;
        this.winner = null;
        this.players = [];
        this.isGameStarted = false;
        this.isGamePaused = false;
        this.isCancelledGame = false;
        this.playerWidthPercentage = game_settings_1.GAME_SETTINGS.PLAYERS_WIDTH_PERCENTAGE;
        this.playerHeightPercentage = game_settings_1.GAME_SETTINGS.PLAYERS_HEIGHT_PERCENTAGE;
        this.fractionForSpeed = game_settings_1.GAME_SETTINGS.FRACTION_FOR_SPEED;
        this.ballSizePercentage = game_settings_1.GAME_SETTINGS.BALL_SIZE_PERCENTAGE;
        this.ballSpeedFactor = game_settings_1.GAME_SETTINGS.BALL_SPEED_FACTOR;
        this.ballSpeed = Math.min(this.width, this.height) * this.ballSpeedFactor;
        this.ballVelocity = game_settings_1.GAME_SETTINGS.BALL_VELOCITY;
        this.ballSize = Math.min(this.width, this.height) * (this.ballSizePercentage / 100);
        this.initGameEntities();
    }
    async createGame() {
        const gameData = {
            player1: { connect: { userId: this.players[0] } },
            player2: { connect: { userId: this.players[1] } },
            gameStatus: client_1.GameStatus.CANCELED,
            minScore: 0,
            maxScore: 0,
        };
        try {
            const game = await this.database.game.create({
                data: gameData,
            });
            if (game) {
                this.gameId = game.id;
            }
        }
        catch (error) {
            console.error('Failed to save game data:', error);
            throw error;
        }
    }
    async updateGameState() {
        const updateGame = {
            winner: { connect: { userId: this.winner } },
            gameStatus: client_1.GameStatus.PLAYED,
            minScore: Math.min(this.leftPlayer.score, this.rightPlayer.score),
            maxScore: Math.max(this.leftPlayer.score, this.rightPlayer.score),
        };
        try {
            await this.database.game.update({
                where: { id: this.gameId },
                data: updateGame,
            });
        }
        catch (error) {
            console.error('Failed to update game state:', error);
            throw error;
        }
    }
    async initGameEntities() {
        const playersWidth = (this.width * this.playerWidthPercentage) / 100;
        const playersHeight = (this.height * this.playerHeightPercentage) / 100;
        this.leftPlayer = new Player_entity_1.Player(0, (this.height - playersHeight) / 2, playersWidth, playersHeight, 0, this.fractionForSpeed);
        this.rightPlayer = new Player_entity_1.Player(this.width - playersWidth, (this.height - playersHeight) / 2, playersWidth, playersHeight, 0, this.fractionForSpeed);
        this.ball = new Ball_entity_1.Ball(this.width / 2, this.height / 2, this.ballSize, this.ballVelocity, this.ballVelocity, this.ballSpeed);
    }
    setServer(server, roomId, players) {
        this.server = server;
        this.room = roomId;
        this.players = players;
    }
    async updateGameScores() {
        if (this.ball.x - this.ball.radius < 0) {
            this.rightPlayer.score++;
            if (this.rightPlayer.score >= this.target) {
                this.winner = this.players[1];
                await this.endGame();
            }
            this.ball.resetBall(this.width, this.height);
        }
        else if (this.ball.x + this.ball.radius > this.width) {
            this.leftPlayer.score++;
            if (this.leftPlayer.score >= this.target) {
                this.winner = this.players[0];
                await this.endGame();
            }
            this.ball.resetBall(this.width, this.height);
        }
    }
    async startGame() {
        if (this.isCancelledGame) {
            return;
        }
        await this.createGame();
        this.isGameStarted = true;
        this.logger.log(`Game: ${this.gameId} is starting`);
        this.loop = setInterval(() => {
            if (!this.isGamePaused) {
                this.update();
            }
        }, 1000 / this.framePerSeconds);
    }
    update() {
        this.updateGameScores();
        this.ball.ballTopAndBottomCollision(this.height);
        this.ball.moveBall();
        const player = this.ball.x + this.ball.radius < this.width / 2
            ? this.leftPlayer
            : this.rightPlayer;
        if (this.ball.ballPlayerCollision(player)) {
            this.handleBallCollision(player);
        }
        this.server
            .to(this.room)
            .emit(socket_constants_1.SOCKET_EVENT.GAME_UPDATES, this.getGameState());
    }
    async endGame() {
        this.pauseGameExecution();
        this.server.to(this.room).emit(socket_constants_1.SOCKET_EVENT.ENDING_GAME);
        if (!this.winner) {
            this.disconnectClients();
        }
        const winner = await this.database.user.findUnique({
            where: {
                userId: this.winner,
            },
            select: {
                username: true,
                firstName: true,
                lastName: true,
            },
        });
        try {
            if (!this.gameId)
                return;
            await this.updateGameState();
        }
        catch (error) {
            console.error('could not save game in the database');
        }
        this.server.to(this.room).emit(socket_constants_1.SOCKET_EVENT.GAME_END, {
            winnerId: this.winner,
            winnerUserName: winner.username,
        });
        this.disconnectClients();
        this.logger.log(`Game: ${this.gameId} Ended`);
        this.clearGameState();
    }
    disconnectClients() {
        this.players.forEach((playerId) => {
            this.connectionService.updateUserStatus(playerId, user_status_enum_1.UserStatus.FINISHED_GAME);
        });
        this.players.forEach((player) => {
            const playerSocket = this.connectionService.getSocketByUserId(player);
            if (playerSocket) {
                playerSocket.disconnect();
            }
        });
    }
    handlePlayerMovement(player, direction) {
        if (player === 1) {
            this.leftPlayer.movePlayer(this.height, direction);
        }
        else if (player === 2) {
            this.rightPlayer.movePlayer(this.height, direction);
        }
    }
    handleBallCollision(player) {
        const collidePoint = this.ball.y - (player.y + player.height / 2);
        const angleRad = (Math.PI / 4) * (collidePoint / (player.height / 2));
        const direction = this.ball.x + this.ball.radius < this.width / 2 ? 1 : -1;
        this.ball.velocityX = direction * this.ball.speed * Math.cos(angleRad);
        this.ball.velocityY = this.ball.speed * Math.sin(angleRad);
        this.ball.speed += 0.1;
    }
    getGameState() {
        return {
            player1: {
                x: this.leftPlayer.x,
                y: this.leftPlayer.y,
                w: this.leftPlayer.width,
                h: this.leftPlayer.height,
                score: this.leftPlayer.score,
            },
            player2: {
                x: this.rightPlayer.x,
                y: this.rightPlayer.y,
                w: this.rightPlayer.width,
                h: this.rightPlayer.height,
                score: this.rightPlayer.score,
            },
            ball: {
                x: this.ball.x,
                y: this.ball.y,
                r: this.ball.radius,
            },
        };
    }
    clearGameState() {
        this.initGameEntities();
        this.isGamePaused = false;
        this.isCancelledGame = false;
        this.isGameStarted = false;
        this.winner = null;
        if (this.loop !== null) {
            clearInterval(this.loop);
            this.loop = null;
        }
    }
    pauseGameExecution() {
        this.isGamePaused = true;
        if (this.loop !== null) {
            clearInterval(this.loop);
            this.loop = null;
        }
    }
    setIsCancelledGame() {
        if (!this.isCancelledGame) {
            this.isCancelledGame = true;
        }
    }
    isGameScoresChanged() {
        if (this.leftPlayer.score !== 0 || this.rightPlayer.score !== 0) {
            return true;
        }
        else {
            return false;
        }
    }
    setWinner(userId) {
        if (userId) {
            this.winner = userId;
        }
    }
};
exports.GameService = GameService;
exports.GameService = GameService = GameService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        connection_service_1.ConnectionService])
], GameService);
//# sourceMappingURL=game.service.js.map