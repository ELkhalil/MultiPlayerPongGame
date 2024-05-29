import { GAME_SETTING } from "../constants/settings";

export class Player {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
  color: string;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    score: number,
    color: string
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.score = score;
    this.color = color;
  }

  drawPlayer(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  drawScore(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    ctx.fillStyle = GAME_SETTING.PLAYER_DEF_COLOR;
    ctx.font = GAME_SETTING.DEFAULT_FONT;
    ctx.fillText(this.score.toString(), width, height);
  }
}
