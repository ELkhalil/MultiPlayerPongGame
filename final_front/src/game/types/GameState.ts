import { BallState } from "./BallState";
import { PlayerState } from "./PlayerState";

export interface GameState {
  player1: PlayerState;
  player2: PlayerState;
  ball: BallState;
}
