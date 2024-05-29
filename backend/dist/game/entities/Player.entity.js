"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(x, y, width, height, score, fractionOfHeigh) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.score = score;
        this.fractionOfHeigh = fractionOfHeigh;
    }
    movePlayer(gameHeight, direction) {
        const moveSpeed = this.fractionOfHeigh * gameHeight;
        if (direction === 'up') {
            if (this.y - moveSpeed < 0) {
                this.y = 0;
            }
            else {
                this.y -= moveSpeed;
            }
        }
        else if (direction === 'down') {
            if (this.y + this.height + moveSpeed > gameHeight) {
                this.y = gameHeight - this.height;
            }
            else {
                this.y += moveSpeed;
            }
        }
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.entity.js.map