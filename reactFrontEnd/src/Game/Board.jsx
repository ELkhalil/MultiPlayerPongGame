import { useEffect, useRef } from "react";
import { Player } from "./GameObjects/Player";
import { Ball } from "./GameObjects/Ball";
import socketIO from "socket.io-client";

export default function Board() {
  const canvasRef = useRef(null);
  const messageRef = useRef(null);
  const socketRef = useRef(
    socketIO.connect("http://localhost:3000/game", {
      transports: ["websocket"],
    })
  );

  function startGame() {
    startBtn.style.display = "none";
    if (socketRef.current.connected) {
      socketRef.current.emit("joinQueue");
      messageRef.current.innerText = "Waiting for other player...";
    } else {
      messageRef.current.innerText = "Refresh the page and try again...";
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let isGameRunning = false;
    let CurrentRoom;
    let playerNumber;
    let player1 = new Player(0, (canvas.height - 100) / 2, 100, 0, "white");
    let player2 = new Player(
      canvas.width - 10,
      (canvas.height - 100) / 2,
      100,
      0,
      "white"
    );
    let ball = new Ball(canvas.width / 2, canvas.height / 2, 10, "white");

    socketRef.current.on("matchFound", (data) => {
      console.log(data);
      CurrentRoom = data.roomId;
      playerNumber = data.playerNumber;
    });

    function startTimer(gameState) {
      let timerValue = 5;
      let timerInterval = setInterval(() => {
        if (timerValue === 0) {
          clearInterval(timerInterval);
          initGame(gameState);
          isGameRunning = true;
        } else {
          messageRef.current.innerText = `Starting in ${timerValue} seconds...`;
          timerValue--;
        }
      }, 1000);
    }

    socketRef.current.on("startingGame", (gameState) => {
      messageRef.current.innerText = "We are going to start the game...";
      startTimer(gameState);
    });

    function initGame(gameState) {
      messageRef.current.innerText = "";
      player1 = new Player(
        gameState.player1.x,
        gameState.player1.y,
        gameState.player1.h,
        gameState.player1.score,
        "white"
      );
      player2 = new Player(
        gameState.player2.x,
        gameState.player2.y,
        gameState.player2.h,
        gameState.player2.score,
        "white"
      );
      ball = new Ball(
        gameState.ball.x,
        gameState.ball.y,
        gameState.ball.r,
        "white"
      );

      window.addEventListener("keydown", (e) => {
        if (isGameRunning) {
          switch (e.code) {
            case "ArrowUp":
              console.log(`${playerNumber} moved up`);
              socketRef.current.emit("movePlayer", {
                roomId: CurrentRoom,
                player: playerNumber,
                direction: "up",
              });
              break;
            case "ArrowDown":
              console.log(`${playerNumber} moved down`);
              socketRef.current.emit("movePlayer", {
                roomId: CurrentRoom,
                player: playerNumber,
                direction: "down",
              });
              break;
          }
        }
      });
      draw();
    }

    socketRef.current.on("matchCancelled", (why) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      messageRef.current.innerText = why.reason;
    });

    socketRef.current.on("gameEnded", (data) => {
      isGameRunning = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (data.winner) {
        messageRef.current.innerText = `Game Over! Winner: ${data.winner}`;
      } else {
        messageRef.current.innerText = `Game ended: ${data.reason}`;
      }
    });

    socketRef.current.on("gameStateUpdate", (gameState) => {
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

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      player1.drawPlayer(ctx);
      player1.drawScore(ctx, canvas.width / 4, canvas.height / 5);
      player2.drawPlayer(ctx);
      player2.drawScore(ctx, (3 * canvas.width) / 4, canvas.height / 5);
      ball.drawBall(ctx);
    }
  }, [socketRef]);

  return (
    <>
      <div className="container">
        <div className="game">
          <canvas
            ref={canvasRef}
            id="canvas"
            height="500px"
            width="800px"
          ></canvas>
          <p ref={messageRef} id="message"></p>
          <button onClick={startGame} id="startBtn">
            START GAME
          </button>
        </div>
      </div>
    </>
  );
}
