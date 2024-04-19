import { Injectable } from '@nestjs/common';
import { Ball } from './entities/Ball.entity';
import { Player } from './entities/Player.entity';
import { Server } from 'socket.io';

@Injectable()
export class GameService {
  private framePerSeconds: number = 60;
  private loop: NodeJS.Timeout | null = null;
  private isPaused = false;
  private leftPlayer: Player;
  private rightPlayer: Player;
  private ball: Ball;
  private server: Server;
  private room: string;
  private target: number = 10;
  private winner: string | null = null;

  constructor(
    private readonly width: number,
    private readonly height: number,
  ) {
    this.framePerSeconds = 60;
    this.width = 800;
    this.height = 500;
    this.initializePlayers();
    this.initializeBall();
  }

  setServer(server: Server, roomId: string) {
    this.server = server;
    this.room = roomId;
    this.initializePlayers();
    this.initializeBall();
  }

  private initializePlayers(): void {
    this.leftPlayer = new Player(0, (this.height - 100) / 2, 10, 100, 0);
    this.rightPlayer = new Player(
      this.width - 10,
      (this.height - 100) / 2,
      10,
      100,
      0,
    );
  }

  private initializeBall(): void {
    this.ball = new Ball(this.width / 2, this.height / 2, 10, 5, 5, 7);
  }

  private updateGameScores(): void {
    if (this.ball.x - this.ball.radius < 0) {
      this.rightPlayer.score++;
      if (this.rightPlayer.score >= this.target) {
        this.winner = 'Right Player';
        this.endGame();
      }
      this.ball.resetBall(this.width, this.height);
    } else if (this.ball.x + this.ball.radius > this.width) {
      this.leftPlayer.score++;
      if (this.leftPlayer.score >= this.target) {
        this.winner = 'Left Player';
        this.endGame();
      }
      this.ball.resetBall(this.width, this.height);
    }
  }

  handlePlayerMovement(player: number, direction: 'up' | 'down'): void {
    if (player === 1) {
      this.leftPlayer.movePlayer(this.height, direction);
    } else if (player === 2) {
      this.rightPlayer.movePlayer(this.height, direction);
    }
  }

  private autoAiControl(): void {
    this.rightPlayer.y +=
      (this.ball.y - (this.rightPlayer.y + this.rightPlayer.height / 2)) * 0.1;
    if (this.rightPlayer.y < 0) {
      this.rightPlayer.y = 0;
    } else if (this.rightPlayer.y + this.rightPlayer.height > this.height) {
      this.rightPlayer.y = this.height - this.rightPlayer.height;
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
        h: this.leftPlayer.height,
        score: this.leftPlayer.score,
      },
      player2: {
        x: this.rightPlayer.x,
        y: this.rightPlayer.y,
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

  update(): void {
    this.updateGameScores();
    this.ball.moveBall();
    this.ball.ballTopAndBottomCollision(this.height);
    const player =
      this.ball.x + this.ball.radius < this.width / 2
        ? this.leftPlayer
        : this.rightPlayer;
    if (this.ball.ballPlayerCollision(player)) {
      this.handleBallCollision(player);
    }
    this.server.to(this.room).emit('gameStateUpdate', this.getGameState());
  }

  startGame(): void {
    this.loop = setInterval(() => {
      if (!this.isPaused) {
        this.update();
      }
    }, 1000 / this.framePerSeconds);
  }

  resumeGame(): void {
    this.isPaused = false;
    if (this.loop === null) {
      this.startGame();
    }
  }

  pauseGame(): void {
    this.isPaused = true;
    if (this.loop !== null) {
      clearInterval(this.loop);
      this.loop = null;
    }
  }

  clearGameState(): void {
    this.initializePlayers();
    this.initializeBall();
    this.isPaused = false;
    if (this.loop !== null) {
      clearInterval(this.loop);
      this.loop = null;
    }
  }

  endGame(): void {
    this.clearGameState(); // Clear game state
    // Emit 'gameEnded' event with winner information
    this.server.to(this.room).emit('gameEnded', { winner: this.winner });
  }
}
