import { useNavigate } from "react-router-dom";
import { PATHS } from "../../constants/paths";
import { useEffect, useRef, useState } from "react";
import { GAME_SETTING } from "../../constants/settings";
import { GameAlgo } from "../../algo/GameAlgo";
import ProgressBar from "../ProgressBar/ProgressBar";
import "./BotMode.css";
import StatusCard from "../StatusCard/StatusCard";

/* STATIC PATHS FOR TESTING */
const mapPath = "/assets/game/maps/15.png";
const skinPath = "/assets/game/skins/hacker.png";

export default function BotMode() {
  const [timerValue, setTimerValue] = useState<number>(
    GAME_SETTING.TIMER_VALUE
  );
  const [winner, setWinner] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<GameAlgo | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const navigate = useNavigate();

  const winnerCallback = (winner: string) => {
    setWinner(winner);
  };

  /* Timer */
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;

    startTimer();

    function startTimer() {
      timerInterval = setInterval(() => {
        if (timerValue === 0) {
          if (timerInterval) {
            clearInterval(timerInterval);
          }
          setGameStarted(true);
        } else {
          gradualProgressUpdate();
          setTimerValue(timerValue - 1);
        }
      }, 1000);
    }
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerValue]);

  /* Game */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const game = new GameAlgo(ctx, mapPath, skinPath, winnerCallback);
    gameRef.current = game;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "ArrowUp":
          console.log("ArrowUp");
          if (game.player) {
            game.player.movePlayer(game.height, "up");
          }
          break;
        case "ArrowDown":
          console.log("ArrowDown");
          if (game.player) {
            game.player.movePlayer(game.height, "down");
          }
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    if (gameStarted) {
      game.startGame(ctx);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameStarted]);

  const leaveBotMode = () => {
    navigate(PATHS.DEFAULT_GAME_PAGE);
  };

  const gradualProgressUpdate = () => {
    setProgress((prevProgress) => {
      const newProgress = prevProgress + 33.33;
      if (newProgress >= 100) {
        return 100;
      }
      return newProgress;
    });
  };

  return (
    <div className="botModeContainer">
      <h1 className="botModeHeading">Welcome! to the Practice Mode</h1>
      <div className="progressContainer">
        {!gameStarted && <ProgressBar progress={progress} />}
      </div>
      <div className="canvasContainer">
        {gameStarted && !winner && (
          <canvas
            ref={canvasRef}
            className="game"
            width="800px"
            height="500px"
          ></canvas>
        )}
        {winner && (
          <StatusCard
            title="Game Over!"
            message={`Game Over! Winner: ${winner}`}
          />
        )}
      </div>
      <button className="backButton" onClick={leaveBotMode}>
        Leave Bot
      </button>
    </div>
  );
}
