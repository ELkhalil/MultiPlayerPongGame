export class Player {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
  color: string;
  fractionOfHeight: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    score: number,
    color: string,
    fractionOfHeight: number
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.score = score;
    this.color = color;
    this.fractionOfHeight = fractionOfHeight;
  }

  drawPlayer(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  movePlayer(gameHeight: number, direction: "up" | "down") {
    const moveSpeed = this.fractionOfHeight * gameHeight;
    if (direction === "up") {
      if (this.y - moveSpeed < 0) {
        this.y = 0;
      } else {
        this.y -= moveSpeed;
      }
    } else if (direction === "down") {
      if (this.y + this.height + moveSpeed > gameHeight) {
        this.y = gameHeight - this.height;
      } else {
        this.y += moveSpeed;
      }
    }
  }
}
