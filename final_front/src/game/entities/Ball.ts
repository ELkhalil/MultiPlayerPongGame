import { GAME_SETTING } from "../constants/settings";

export class Ball {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  speed: number;
  initialSpeed: number;
  color: string;

  constructor(
    x: number,
    y: number,
    radius: number,
    velocityX: number,
    velocityY: number,
    speed: number,
    color: string
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.speed = speed;
    this.initialSpeed = speed;
    this.color = color;
  }

  drawBall(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  }

  drawHit(ctx: CanvasRenderingContext2D, hitBallSize: number) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(
      this.x,
      this.y,
      hitBallSize / 2,
      hitBallSize / 4,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "WHITE";
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.restore();
  }

  moveBall() {
    this.x += this.velocityX;
    this.y += this.velocityY;
  }

  resetBall(width: number, height: number) {
    this.speed = this.initialSpeed;
    this.x = width / 2;
    this.y = height / 2;
    this.velocityX = -this.velocityX;
  }

  ballPlayerCollision(player: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) {
    return (
      player.x + GAME_SETTING.RANGE_TOLERANCE < this.x + this.radius &&
      player.y + GAME_SETTING.RANGE_TOLERANCE < this.y + this.radius &&
      player.x + GAME_SETTING.RANGE_TOLERANCE + player.width >
        this.x - this.radius &&
      player.y + GAME_SETTING.RANGE_TOLERANCE + player.height >
        this.y - this.radius
    );
  }

  ballTopAndBottomCollision(
    gameHeight: number,
    ctx: CanvasRenderingContext2D,
    hitBallSize: number
  ) {
    if (this.y - this.radius < 5 || this.y + this.radius > gameHeight - 5) {
      this.drawHit(ctx, hitBallSize);
      this.velocityY = -this.velocityY;
    }
  }
}
