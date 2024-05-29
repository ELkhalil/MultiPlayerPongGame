export declare class Ball {
    x: number;
    y: number;
    radius: number;
    velocityX: number;
    velocityY: number;
    speed: number;
    initialSpeed: number;
    constructor(x: number, y: number, radius: number, velocityX: number, velocityY: number, speed: number);
    moveBall(): void;
    resetBall(width: number, height: number): void;
    ballPlayerCollision(player: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): boolean;
    ballTopAndBottomCollision(gameHeight: number): void;
}
