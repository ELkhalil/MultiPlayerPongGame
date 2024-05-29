export class Player {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
  moveSpeed: number;
  fractionOfHeigh: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    score: number,
    fractionOfHeigh: number,
  ) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.score = score;
    this.fractionOfHeigh = fractionOfHeigh;
  }

  movePlayer(gameHeight: number, direction: 'up' | 'down') {
    const moveSpeed = this.fractionOfHeigh * gameHeight;

    if (direction === 'up') {
      if (this.y - moveSpeed < 0) {
        this.y = 0;
      } else {
        this.y -= moveSpeed;
      }
    } else if (direction === 'down') {
      if (this.y + this.height + moveSpeed > gameHeight) {
        this.y = gameHeight - this.height;
      } else {
        this.y += moveSpeed;
      }
    }
  }
}
