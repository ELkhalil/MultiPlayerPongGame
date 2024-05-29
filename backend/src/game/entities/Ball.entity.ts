export class Ball {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  speed: number;
  initialSpeed: number;

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
    this.initialSpeed = speed;
  }

  moveBall() {
    this.x += this.velocityX;
    this.y += this.velocityY;
  }

  resetBall(width: number, height: number) {
    this.x = width / 2;
    this.y = height / 2;
    this.velocityX = -this.velocityX;
    this.speed = this.initialSpeed;
  }

  ballPlayerCollision(player: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) {
    return (
      player.x + 3 < this.x + this.radius &&
      player.y + 3 < this.y + this.radius &&
      player.x + 3 + player.width > this.x - this.radius &&
      player.y + 3 + player.height > this.y - this.radius
    );
  }

  ballTopAndBottomCollision(gameHeight: number) {
    if (this.y - this.radius < 5 || this.y + this.radius > gameHeight - 5) {
      this.velocityY = -this.velocityY;
    }
  }
}
