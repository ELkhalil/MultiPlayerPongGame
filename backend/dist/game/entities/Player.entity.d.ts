export declare class Player {
    x: number;
    y: number;
    width: number;
    height: number;
    score: number;
    moveSpeed: number;
    fractionOfHeigh: number;
    constructor(x: number, y: number, width: number, height: number, score: number, fractionOfHeigh: number);
    movePlayer(gameHeight: number, direction: 'up' | 'down'): void;
}
