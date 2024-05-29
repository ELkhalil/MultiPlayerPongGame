import { Player } from "../entities/Player";
import { Ball } from "../entities/Ball";
import { GAME_SETTING } from "../constants/settings";

export class GameAlgo {
  width: number;
  height: number;
  framePerSeconds: number;
  loop: NodeJS.Timeout | null;
  ctx: CanvasRenderingContext2D | null;
  target: number;
  player: Player | null;
  computer: Player | null;
  ball: Ball | null;
  defaultColor: string;
  playerWidthPercentage: number;
  playerHeightPercentage: number;
  fractionForSpeed: number;
  ballSizePercentage: number;
  ballSpeedFactor: number;
  ballSpeed: number;
  ballVelocity: number;
  ballSize: number;
  netWidth: number;
  netGap: number;
  font: string;
  ballHitSound: HTMLAudioElement | null;
  scoreSound: HTMLAudioElement | null;
  gameOverSound: HTMLAudioElement | null;
  bgImage: HTMLImageElement | null;
  isBgImageLoaded: boolean = false;
  isSkinImageLoaded: boolean = false;
  skinImage: HTMLImageElement | null;
  hitBallColor: string;
  hitBallSizeX: number;
  hitBallSizeY: number;
  mapPath: string;
  skinPath: string;
  winnerCallback: (winner: string) => void;

  constructor(
    ctx: CanvasRenderingContext2D,
    mapPath: string,
    skinPath: string,
    winnerCallback: (winner: string) => void
  ) {
    this.width = GAME_SETTING.GAME_WIDTH;
    this.height = GAME_SETTING.GAME_HEIGHT;
    this.framePerSeconds = GAME_SETTING.FRAME_PER_SECONDS;
    this.loop = null;
    this.ctx = ctx;
    this.target = GAME_SETTING.GAME_TARGET;
    this.player = null;
    this.computer = null;
    this.ball = null;
    this.mapPath = mapPath;
    this.skinPath = skinPath;
    this.winnerCallback = winnerCallback;

    /* Game General Settings */
    this.defaultColor = GAME_SETTING.DEFAULT_COLOR;

    /* Players Settings */
    this.playerWidthPercentage = GAME_SETTING.PLAYERS_WIDTH_PERCENTAGE;
    this.playerHeightPercentage = GAME_SETTING.PLAYERS_HEIGHT_PERCENTAGE;
    this.fractionForSpeed = GAME_SETTING.FRACTION_FOR_SPEED;

    /* Ball Settings */
    this.ballSizePercentage = GAME_SETTING.BALL_SIZE_PERCENTAGE;
    this.ballSpeedFactor = GAME_SETTING.BALL_SPEED_FACTOR;
    this.ballSpeed = Math.min(this.width, this.height) * this.ballSpeedFactor;
    this.ballVelocity = GAME_SETTING.BALL_VELOCITY;
    this.ballSize =
      Math.min(this.width, this.height) * (this.ballSizePercentage / 100);

    /* Net Settings */
    this.netWidth = Math.ceil(this.width * 0.006);
    this.netGap = Math.ceil(this.height * 0.04);

    /* Scores Settings */
    this.font = GAME_SETTING.DEFAULT_FONT;

    /* Sounds Settings */
    this.ballHitSound = null;
    this.scoreSound = null;
    this.gameOverSound = null;

    /* Skins And Backgrounds */
    this.bgImage = null;
    this.skinImage = null;

    /* Effects Settings */
    this.hitBallColor = GAME_SETTING.HIT_COLOR;
    this.hitBallSizeX = Math.floor(this.ballSize * 3);
    this.hitBallSizeY = Math.floor(this.ballSize * 2.5);

    /* Init Data*/
    this.initGameEntities();
    this.preLoadSounds();
    this.preLoadImages();
  }

  /* Game Init Methods */
  initGameEntities() {
    const playersWidth = (this.width * this.playerWidthPercentage) / 100;
    const playersHeight = (this.height * this.playerHeightPercentage) / 100;

    this.player = new Player(
      0,
      (this.height - playersHeight) / 2,
      playersWidth,
      playersHeight,
      0,
      this.defaultColor,
      this.fractionForSpeed
    );
    this.computer = new Player(
      this.width - playersWidth,
      (this.height - playersHeight) / 2,
      playersWidth,
      playersHeight,
      0,
      this.defaultColor,
      this.fractionForSpeed
    );
    this.ball = new Ball(
      this.width / 2,
      this.height / 2,
      this.ballSize,
      this.ballVelocity,
      this.ballVelocity,
      this.ballSpeed,
      this.defaultColor
    );
    this.preLoadSounds();
  }

  /* Drawing Methods */
  drawScores(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.defaultColor;
    ctx.font = this.font;
    ctx.fillText(
      this.player!.score.toString(),
      this.width / 4,
      this.height / 5
    );
    ctx.fillText(
      this.computer!.score.toString(),
      (3 * this.width) / 4,
      this.height / 5
    );
  }
  drawNet(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.defaultColor; // Fix: Changed to defaultColor
    ctx.beginPath();
    for (let y = this.netGap; y < this.height; y += this.netGap * 2) {
      ctx.rect((this.width - this.netWidth) / 2, y, this.netWidth, this.netGap);
    }
    ctx.fill();
  }
  drawFlash(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(
      x,
      y,
      this.hitBallSizeX / 2,
      this.hitBallSizeY / 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = this.hitBallColor;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.restore();
  }

  drawPlayerShadow(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    const shadowOffsetX = 3;
    const shadowOffsetY = 5;
    ctx.fillRect(
      this.player!.x + shadowOffsetX,
      this.player!.y + shadowOffsetY,
      this.player!.width,
      this.player!.height
    );
  }
  drawBallTrail(ctx: CanvasRenderingContext2D) {
    const numSegments = 6;
    const opacityStep = 0.1;
    let opacity = 0.4;
    const opacityDelta = opacityStep;
    for (let i = 0; i < numSegments; i++) {
      ctx.beginPath();
      ctx.arc(
        this.ball!.x - this.ball!.velocityX * i,
        this.ball!.y - this.ball!.velocityY * i,
        this.ball!.radius,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
      opacity -= opacityDelta;
    }
  }

  /* Loading Images/Sounds For The Game */
  preLoadImages() {
    this.bgImage = new Image();
    this.skinImage = new Image();

    this.bgImage.onload = () => {
      this.isBgImageLoaded = true;
    };

    this.skinImage.onload = () => {
      this.isSkinImageLoaded = true;
    };

    this.bgImage.onerror = () => {
      this.isBgImageLoaded = false;
    };

    this.skinImage.onerror = () => {
      this.isSkinImageLoaded = false;
    };

    this.bgImage.src = this.mapPath;
    this.skinImage.src = this.skinPath;
  }

  preLoadSounds() {
    this.ballHitSound = new Audio(GAME_SETTING.HIT_BALL_SOUND);
    this.scoreSound = new Audio(GAME_SETTING.SCORE_SOUND);
  }

  /* On Going Game Settings */
  updateScores() {
    if (this.ball!.x - this.ball!.radius < 0) {
      this.playScoreSound();
      this.computer!.score++;
      if (this.computer!.score >= this.target) {
        this.endGame("Bot");
      }
      this.ball!.resetBall(this.width, this.height);
    } else if (this.ball!.x + this.ball!.radius > this.width) {
      this.playScoreSound();
      this.player!.score++;
      if (this.player!.score >= this.target) {
        this.endGame("Player");
      }
      this.ball!.resetBall(this.width, this.height);
    }
  }

  playScoreSound() {
    if (this.scoreSound) {
      this.scoreSound.pause();
      this.scoreSound.currentTime = 0;
      this.scoreSound.play();
    }
  }

  /* Control Bot  */
  botControlOn() {
    this.computer!.y +=
      (this.ball!.y - (this.computer!.y + this.computer!.height / 2)) * 0.1;
    if (this.computer!.y < 0) {
      this.computer!.y = 0;
    } else if (this.computer!.y + this.computer!.height > this.height) {
      this.computer!.y = this.height - this.computer!.height;
    }
  }

  /* Game Control */
  startGame(ctx: CanvasRenderingContext2D) {
    if (!ctx) {
      return;
    }
    this.ctx = ctx;
    this.loop = setInterval(() => {
      if (this.ctx) {
        this.render(this.ctx);
      }
      this.update();
    }, 1000 / this.framePerSeconds);
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
    if (this.isBgImageLoaded && this.bgImage) {
      ctx.drawImage(this.bgImage, 0, 0, this.width, this.height);
    } else {
      ctx.fillStyle = "BLACK";
      ctx.fillRect(0, 0, this.width, this.height);
    }
    this.drawScores(ctx);
    this.drawNet(ctx);
    this.drawPlayerShadow(ctx);
    if (this.isSkinImageLoaded && this.skinImage) {
      ctx.drawImage(
        this.skinImage,
        this.player!.x,
        this.player!.y,
        this.player!.width,
        this.player!.height
      );
      ctx.drawImage(
        this.skinImage,
        this.computer!.x,
        this.computer!.y,
        this.computer!.width,
        this.computer!.height
      );
    } else {
      this.player!.drawPlayer(ctx);
      this.computer!.drawPlayer(ctx);
    }
    this.drawBallTrail(ctx);
    this.ball!.drawBall(ctx);
  }

  update() {
    if (!this.ctx) return;

    this.updateScores();
    this.ball!.ballTopAndBottomCollision(
      this.height,
      this.ctx,
      this.hitBallSizeX
    );
    this.ball!.moveBall();
    this.botControlOn();
    const player =
      this.ball!.x + this.ball!.radius < this.width / 2
        ? this.player
        : this.computer;
    if (this.ball!.ballPlayerCollision(player!)) {
      if (this.ballHitSound && this.ballHitSound.readyState === 4) {
        this.ballHitSound.pause();
        this.ballHitSound.currentTime = 0;
        this.ballHitSound.play();
      }
      let collidePoint = this.ball!.y - (player!.y + player!.height / 2);
      collidePoint = collidePoint / (player!.height / 2);
      const angleRad = (Math.PI / 4) * collidePoint;
      const direction =
        this.ball!.x + this.ball!.radius < this.width / 2 ? 1 : -1;
      this.ball!.velocityX = direction * this.ball!.speed * Math.cos(angleRad);
      this.ball!.velocityY = this.ball!.speed * Math.sin(angleRad);
      this.ball!.speed += 0.1;
      this.drawFlash(this.ctx, this.ball!.x, this.ball!.y);
    }
  }

  endGame(winner: string) {
    if (this.loop) {
      clearInterval(this.loop);
    }
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
    this.winnerCallback(winner);
    // TODO: need to clean images / sounds before closing
  }

  /* CleanUp Methods */
  cleanupImages() {
    if (this.bgImage) {
      this.bgImage.src = "";
    }
    if (this.skinImage) {
      this.skinImage.src = "";
    }
  }
  cleanupSounds() {
    if (this.ballHitSound) {
      this.ballHitSound.pause();
      this.ballHitSound.currentTime = 0;
    }
    if (this.scoreSound) {
      this.scoreSound.pause();
      this.scoreSound.currentTime = 0;
    }
    if (this.gameOverSound) {
      this.gameOverSound.pause();
      this.gameOverSound.currentTime = 0;
    }
  }
}
