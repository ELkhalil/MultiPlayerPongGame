export class Player {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
  color: string;
  moveSpeed: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    score: number,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.score = score;
    this.moveSpeed = 20;
  }

  movePlayer(gameHeight: number, direction: 'up' | 'down'): void {
    if (direction === 'up') {
      if (this.y - this.moveSpeed < 0) {
        this.y = 0;
      } else {
        this.y -= this.moveSpeed;
      }
    } else if (direction === 'down') {
      if (this.y + this.height + this.moveSpeed > gameHeight) {
        this.y = gameHeight - this.height;
      } else {
        this.y += this.moveSpeed;
      }
    }
  }
}
