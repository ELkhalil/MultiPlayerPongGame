export class Ball {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  speed: number;

  constructor(
    x: number,
    y: number,
    radius: number,
    velocityX: number,
    velocityY: number,
    speed: number,
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.speed = speed;
  }

  moveBall(): void {
    this.x += this.velocityX;
    this.y += this.velocityY;
  }

  resetBall(width: number, height: number): void {
    this.x = width / 2;
    this.y = height / 2;
    this.velocityX = -this.velocityX;
    this.speed = 7;
  }

  ballPlayerCollision(player: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): boolean {
    return (
      player.x < this.x + this.radius &&
      player.y < this.y + this.radius &&
      player.x + player.width > this.x - this.radius &&
      player.y + player.height > this.y - this.radius
    );
  }

  ballTopAndBottomCollision(gameHeight: number): void {
    if (this.y - this.radius < 0 || this.y + this.radius > gameHeight) {
      this.velocityY = -this.velocityY;
    }
  }
}
