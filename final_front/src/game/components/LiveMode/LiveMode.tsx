import React, { useEffect, useRef, useState } from "react";
import { Player } from "../../entities/PlayerDS";
import { Ball } from "../../entities/BallDS";
import { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "../../constants/socketEvents";
import { GAME_SETTING } from "../../constants/settings";
import { GameState } from "../../types/GameState";
import StatusCard from "../StatusCard/StatusCard";
import ProgressBar from "../ProgressBar/ProgressBar";
import _debounce from "lodash/debounce";
import "./LiveMode.css";

interface LiveGameModeProps {
  socketRef: React.MutableRefObject<Socket | null>;
  opponent: string;
  roomId: string;
  playerPos: number;
  gameData: GameState;
}

/* STATIC PATHS FOR TESTING */
const mapPath = "/assets/game/maps/15.png";
const skinPath = "/assets/game/skins/bomb.png";

export default function LiveMode({
  socketRef,
  opponent,
  roomId,
  playerPos,
  gameData,
}: LiveGameModeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socket = useRef<Socket | null>(socketRef.current);
  const [endedGame, setEndedGame] = useState(false);
  const [cancelledGame, setCancelledGame] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const skinImageRef = useRef<HTMLImageElement | null>(null);
  const [isBgImageLoaded, setIsBgImageLoaded] = useState(false);
  const [isSkinImageLoaded, setIsSkinImageLoaded] = useState(false);

  /* reduce user Spam keyboard */
  const debouncedMovePlayer = useRef(
    _debounce((direction: string) => {
      if (!socket.current) return;
      socket.current.emit("movePlayer", {
        roomId: roomId,
        player: playerPos,
        direction: direction,
      });
    }, GAME_SETTING.EMIT_MOVE_LIMIT)
  ).current;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!socket.current) return;
    switch (e.code) {
      case "ArrowUp":
        debouncedMovePlayer("up");
        break;
      case "ArrowDown":
        debouncedMovePlayer("down");
        break;
    }
  };

  /* Load Assets */
  useEffect(() => {
    const bgImage = new Image();
    const skinImage = new Image();

    bgImage.onload = () => {
      setIsBgImageLoaded(true);
    };

    skinImage.onload = () => {
      setIsSkinImageLoaded(true);
    };

    bgImage.onerror = () => {
      setIsBgImageLoaded(false);
    };

    skinImage.onerror = () => {
      setIsSkinImageLoaded(false);
    };

    bgImage.src = mapPath;
    skinImage.src = skinPath;

    bgImageRef.current = bgImage;
    skinImageRef.current = skinImage;
  }, []);

  /* Timer... */
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;

    startTimer();

    function startTimer() {
      if (gameStarted) return;
      let timerValue = 3;
      timerInterval = setInterval(() => {
        if (cancelledGame) {
          if (timerInterval) {
            clearInterval(timerInterval);
          }
          return;
        }
        if (timerValue === 0) {
          if (timerInterval) {
            clearInterval(timerInterval);
          }
          setGameStarted(true);
        } else {
          gradualProgressUpdate();
          timerValue--;
        }
      }, 1000);
    }

    socket.current?.on(
      SOCKET_EVENTS.OPPONENT_DISCONNECT,
      (data: { message?: string }) => {
        setCancelledGame(true);
        if (data.message) {
          console.log(`opponentDisconnected: ${data.message}`);
        }
        socket.current?.disconnect();
      }
    );
    socket.current?.on(SOCKET_EVENTS.CONNECT_ERROR, (error: string) => {
      console.log("Connect error:", error);
    });
  }, [cancelledGame, gameStarted]);

  /* Live Game */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isGameRunning = false;

    let player1 = new Player(0, (canvas.height - 100) / 2, 10, 100, 0, "white");
    let player2 = new Player(
      canvas.width - 10,
      (canvas.height - 100) / 2,
      10,
      100,
      0,
      "white"
    );
    let ball = new Ball(canvas.width / 2, canvas.height / 2, 10, "white");

    function loadImages() {}

    if (gameStarted) {
      loadImages();
      initGame(gameData);
    }

    function initGame(data: GameState) {
      document.addEventListener("keydown", handleKeyDown);
      isGameRunning = true;
      player1 = new Player(
        data.player1.x,
        data.player1.y,
        data.player1.w,
        data.player1.h,
        data.player1.score,
        "white"
      );
      player2 = new Player(
        data.player2.x,
        data.player2.y,
        data.player2.w,
        data.player2.h,
        data.player2.score,
        "white"
      );
      ball = new Ball(data.ball.x, data.ball.y, data.ball.r, "white");
      draw();
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (isBgImageLoaded && bgImageRef.current) {
        ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "BLACK";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      drawNet(ctx, canvas.height, canvas.width);
      if (isSkinImageLoaded && skinImageRef.current) {
        ctx.drawImage(
          skinImageRef.current,
          player1!.x,
          player1!.y,
          player1!.width,
          player1!.height
        );
        ctx.drawImage(
          skinImageRef.current,
          player2!.x,
          player2!.y,
          player2!.width,
          player2!.height
        );
      } else {
        player1.drawPlayer(ctx);
        player2.drawPlayer(ctx);
      }
      player1.drawScore(ctx, canvas.width / 4, canvas.height / 5);
      player2.drawScore(ctx, (3 * canvas.width) / 4, canvas.height / 5);
      ball.drawBall(ctx);
    }

    socket.current?.on(SOCKET_EVENTS.ENDING_GAME, () => {
      isGameRunning = false;
      console.log("ending game...");
      document.removeEventListener("keydown", handleKeyDown);
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });

    socket.current?.on(
      SOCKET_EVENTS.GAME_END,
      (data: { winnerUserName: string }) => {
        if (data.winnerUserName) {
          setWinner(data.winnerUserName);
        }
        setEndedGame(true);
      }
    );

    socket.current?.on(SOCKET_EVENTS.GAME_UPDATES, (gameState: GameState) => {
      if (isGameRunning) {
        player1.y = gameState.player1.y;
        player2.y = gameState.player2.y;
        player1.score = gameState.player1.score;
        player2.score = gameState.player2.score;
        ball.x = gameState.ball.x;
        ball.y = gameState.ball.y;
        draw();
      }
    });

    socket.current?.on(SOCKET_EVENTS.CONNECT_ERROR, (error: string) => {
      console.log("Connect error:", error);
    });

    socket.current?.on(
      SOCKET_EVENTS.OPPONENT_DISCONNECT,
      (data: { message?: string }) => {
        setCancelledGame(true);
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        if (data.message) {
          console.log(`opponentDisconnected: ${data.message}`);
        }
        socket.current?.disconnect();
      }
    );

    socket.current?.on(
      SOCKET_EVENTS.ONLY_ONE_PLAYER_LEFT,
      (data: { reason?: string }) => {
        setCancelledGame(true);
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        if (data.reason) {
          console.log(`onlyOnePlayerLeft: ${data.reason}`);
        }
        socket.current?.disconnect();
      }
    );
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, gameData, roomId, playerPos, cancelledGame, gameStarted]);

  /* Helper Functions */
  function drawNet(
    ctx: CanvasRenderingContext2D,
    height: number,
    width: number
  ) {
    if (!ctx) return;
    const netGap = Math.ceil(height * 0.04);
    const netWidth = Math.ceil(width * 0.006);

    ctx.fillStyle = GAME_SETTING.DEFAULT_COLOR;
    ctx.beginPath();
    for (let y = netGap; y < height; y += netGap * 2) {
      ctx.rect((width - netWidth) / 2, y, netWidth, netGap);
    }
    ctx.fill();
  }
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
    <div>
      {!cancelledGame && !endedGame && (
        <div className="liveModeContainer">
          <h1 className="liveModeHeading">
            Welcome to the Live Game vs {opponent}
          </h1>
          <div className="progressContainer">
            {!gameStarted && <ProgressBar progress={progress} />}
          </div>
          <div className="canvasContainer">
            {gameStarted && (
              <canvas
                ref={canvasRef}
                className="game"
                width="800px"
                height="500px"
              ></canvas>
            )}
          </div>
        </div>
      )}
      {cancelledGame && (
        <StatusCard
          title="Match Cancelled"
          message="Opponent Disconnected. The match has been cancelled."
        />
      )}
      {endedGame && (
        <StatusCard
          title="Game Over"
          message={`Game Over! Winner: ${winner}`}
        />
      )}
    </div>
  );
}
