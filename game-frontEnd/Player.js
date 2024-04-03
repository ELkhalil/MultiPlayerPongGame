export class Player {
  constructor(x, y, height, score, color) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = 10;
    this.score = score;
    this.color = color;
  }

  drawPlayer(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  drawScore(ctx, width, height) {
    ctx.fillStyle = "#FFF";
    ctx.font = "75px fantasy";
    ctx.fillText(this.score, width, height);
  }
}
