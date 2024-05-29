import { Injectable, Logger } from '@nestjs/common';
import { Ball } from './entities/Ball.entity';
import { Player } from './entities/Player.entity';
import { Server } from 'socket.io';
import { DatabaseService } from 'src/database/database.service';
import { CreateGameDto } from './dtos/createGame.dto';
import { GameStatus } from '@prisma/client';
import { UpdateGameDto } from './dtos/updateGame.dto';
import { ConnectionService } from './connection.service';
import { UserStatus } from './enums/user-status.enum';
import { SOCKET_EVENT } from './constants/socket.constants';
import { GAME_SETTINGS } from './constants/game.settings';

@Injectable()
export class GameService {
  private logger: Logger = new Logger(GameService.name);
  private width: number = GAME_SETTINGS.GAME_WIDTH;
  private height: number = GAME_SETTINGS.GAME_HEIGHT;
  private framePerSeconds: number = GAME_SETTINGS.FRAME_PER_SECONDS;
  private loop: NodeJS.Timeout | null = null;
  private target: number = GAME_SETTINGS.GAME_TARGET;
  private leftPlayer: Player | null = null;
  private rightPlayer: Player | null = null;
  private ball: Ball | null = null;
  private gameId: string | null = null;
  private server: Server;
  private room: string;
  winner: string | null = null;
  private players: string[] = [];
  isGameStarted: boolean = false;
  private isGamePaused: boolean = false;
  private isCancelledGame: boolean = false;

  private playerWidthPercentage: number =
    GAME_SETTINGS.PLAYERS_WIDTH_PERCENTAGE;
  private playerHeightPercentage: number =
    GAME_SETTINGS.PLAYERS_HEIGHT_PERCENTAGE;
  private fractionForSpeed: number = GAME_SETTINGS.FRACTION_FOR_SPEED;

  private ballSizePercentage: number = GAME_SETTINGS.BALL_SIZE_PERCENTAGE;
  private ballSpeedFactor: number = GAME_SETTINGS.BALL_SPEED_FACTOR;
  private ballSpeed: number =
    Math.min(this.width, this.height) * this.ballSpeedFactor;
  private ballVelocity = GAME_SETTINGS.BALL_VELOCITY;
  private ballSize =
    Math.min(this.width, this.height) * (this.ballSizePercentage / 100);

  constructor(
    private readonly database: DatabaseService,
    private readonly connectionService: ConnectionService,
  ) {
    this.initGameEntities();
  }

  async createGame(): Promise<void> {
    const gameData: CreateGameDto = {
      player1: { connect: { userId: this.players[0] } },
      player2: { connect: { userId: this.players[1] } },
      gameStatus: GameStatus.CANCELED,
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
    } catch (error) {
      console.error('Failed to save game data:', error);
      throw error;
    }
  }

  async updateGameState(): Promise<void> {
    const updateGame: UpdateGameDto = {
      winner: { connect: { userId: this.winner } },
      gameStatus: GameStatus.PLAYED,
      minScore: Math.min(this.leftPlayer.score, this.rightPlayer.score),
      maxScore: Math.max(this.leftPlayer.score, this.rightPlayer.score),
    };

    try {
      await this.database.game.update({
        where: { id: this.gameId },
        data: updateGame,
      });
    } catch (error) {
      console.error('Failed to update game state:', error);
      throw error;
    }
  }

  async initGameEntities() {
    const playersWidth = (this.width * this.playerWidthPercentage) / 100;
    const playersHeight = (this.height * this.playerHeightPercentage) / 100;

    this.leftPlayer = new Player(
      0,
      (this.height - playersHeight) / 2,
      playersWidth,
      playersHeight,
      0,
      this.fractionForSpeed,
    );
    this.rightPlayer = new Player(
      this.width - playersWidth,
      (this.height - playersHeight) / 2,
      playersWidth,
      playersHeight,
      0,
      this.fractionForSpeed,
    );
    this.ball = new Ball(
      this.width / 2,
      this.height / 2,
      this.ballSize,
      this.ballVelocity,
      this.ballVelocity,
      this.ballSpeed,
    );
  }

  setServer(server: Server, roomId: string, players: string[]) {
    this.server = server;
    this.room = roomId;
    this.players = players;
  }

  private async updateGameScores() {
    if (this.ball.x - this.ball.radius < 0) {
      this.rightPlayer.score++;
      if (this.rightPlayer.score >= this.target) {
        this.winner = this.players[1];
        await this.endGame();
      }
      this.ball.resetBall(this.width, this.height);
    } else if (this.ball.x + this.ball.radius > this.width) {
      this.leftPlayer.score++;
      if (this.leftPlayer.score >= this.target) {
        this.winner = this.players[0];
        await this.endGame();
      }
      this.ball.resetBall(this.width, this.height);
    }
  }
  /* Game Control */

  async startGame(): Promise<void> {
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

  update(): void {
    this.updateGameScores();
    this.ball.ballTopAndBottomCollision(this.height);
    this.ball.moveBall();
    const player: Player =
      this.ball.x + this.ball.radius < this.width / 2
        ? this.leftPlayer
        : this.rightPlayer;
    if (this.ball.ballPlayerCollision(player)) {
      this.handleBallCollision(player);
    }
    this.server
      .to(this.room)
      .emit(SOCKET_EVENT.GAME_UPDATES, this.getGameState());
  }

  async endGame(): Promise<void> {
    this.pauseGameExecution();
    this.server.to(this.room).emit(SOCKET_EVENT.ENDING_GAME);

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
      if (!this.gameId) return;
      await this.updateGameState();
    } catch (error) {
      console.error('could not save game in the database');
    }

    this.server.to(this.room).emit(SOCKET_EVENT.GAME_END, {
      winnerId: this.winner,
      winnerUserName: winner.username,
    });
    this.disconnectClients();
    this.logger.log(`Game: ${this.gameId} Ended`);
    this.clearGameState();
  }

  private disconnectClients(): void {
    this.players.forEach((playerId) => {
      this.connectionService.updateUserStatus(
        playerId,
        UserStatus.FINISHED_GAME,
      );
    });
    this.players.forEach((player) => {
      const playerSocket = this.connectionService.getSocketByUserId(player);
      if (playerSocket) {
        playerSocket.disconnect();
      }
    });
  }

  handlePlayerMovement(player: number, direction: 'up' | 'down'): void {
    if (player === 1) {
      this.leftPlayer.movePlayer(this.height, direction);
    } else if (player === 2) {
      this.rightPlayer.movePlayer(this.height, direction);
    }
  }

  private handleBallCollision(player: Player): void {
    const collidePoint = this.ball.y - (player.y + player.height / 2);
    const angleRad = (Math.PI / 4) * (collidePoint / (player.height / 2));
    const direction = this.ball.x + this.ball.radius < this.width / 2 ? 1 : -1;
    this.ball.velocityX = direction * this.ball.speed * Math.cos(angleRad);
    this.ball.velocityY = this.ball.speed * Math.sin(angleRad);
    this.ball.speed += 0.1;
  }

  getGameState(): any {
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

  private clearGameState(): void {
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
    } else {
      return false;
    }
  }

  setWinner(userId: string) {
    if (userId) {
      this.winner = userId;
    }
  }
}
