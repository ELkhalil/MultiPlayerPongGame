"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ball = void 0;
class Ball {
    constructor(x, y, radius, velocityX, velocityY, speed) {
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
    resetBall(width, height) {
        this.x = width / 2;
        this.y = height / 2;
        this.velocityX = -this.velocityX;
        this.speed = this.initialSpeed;
    }
    ballPlayerCollision(player) {
        return (player.x + 3 < this.x + this.radius &&
            player.y + 3 < this.y + this.radius &&
            player.x + 3 + player.width > this.x - this.radius &&
            player.y + 3 + player.height > this.y - this.radius);
    }
    ballTopAndBottomCollision(gameHeight) {
        if (this.y - this.radius < 5 || this.y + this.radius > gameHeight - 5) {
            this.velocityY = -this.velocityY;
        }
    }
}
exports.Ball = Ball;
//# sourceMappingURL=Ball.entity.js.map