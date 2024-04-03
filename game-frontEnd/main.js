// Importing modules
import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { Player } from "./Player.js";
import { Ball } from "./Ball.js";

// Getting DOM elements
let startBtn = document.getElementById("startBtn");
let message = document.getElementById("message");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
startBtn.addEventListener("click", startGame);
const pauseButton = document.getElementById("pauseGame");
const resumeButton = document.getElementById("resumeGame");

// Setting up socket connection
const socket = io("http://localhost:3000/game", {
  transports: ["websocket"],
});

pauseButton.addEventListener("click", () => pauseGame(CurrentRoom));
resumeButton.addEventListener("click", () => resumeGame(CurrentRoom));

// Variables for game state
let isGameRunning = false;
let isPaused = false; // Set isPaused to false by default
let CurrentRoom;
let playerNumber;
let player1 = new Player(0, (canvas.height - 100) / 2, 100, 0, "WHITE");
let player2 = new Player(
  canvas.width - 10,
  (canvas.height - 100) / 2,
  100,
  0,
  "WHITE"
);
let ball = new Ball(canvas.width / 2, canvas.height / 2, 10, "WHITE");

// Function to start the game
function startGame() {
  startBtn.style.display = "none";
  if (socket.connected) {
    socket.emit("joinQueue");
    message.innerText = "Waiting for other player...";
  } else {
    message.innerText = "Refresh the page and try again...";
  }
}

// Event listener for "matchFound" event
socket.on("matchFound", (data) => {
  console.log(data);
  CurrentRoom = data.roomId;
  playerNumber = data.playerNumber;
});

// Function to start the timer
function startTimer(gameState) {
  let timerValue = 5; // Initial value of the timer in seconds
  let timerInterval = setInterval(() => {
    if (timerValue === 0) {
      clearInterval(timerInterval);
      initGame(gameState);
      isGameRunning = true;
    } else {
      message.innerText = `Starting in ${timerValue} seconds...`;
      timerValue--;
    }
  }, 1000);
}

// Event listener for "startingGame" event
socket.on("startingGame", (gameState) => {
  message.innerText = "We are going to start the game...";
  startTimer(gameState);
});

// Function to initialize the game
function initGame(gameState) {
  message.innerText = "";
  player1 = new Player(
    gameState.player1.x,
    gameState.player1.y,
    gameState.player1.h,
    gameState.player1.score,
    "red"
  );
  player2 = new Player(
    gameState.player2.x,
    gameState.player2.y,
    gameState.player2.h,
    gameState.player2.score,
    "blue"
  );
  ball = new Ball(
    gameState.ball.x,
    gameState.ball.y,
    gameState.ball.r,
    "white"
  );

  window.addEventListener("keydown", (e) => {
    if (isGameRunning && !isPaused) {
      switch (e.code) {
        case "ArrowUp":
          console.log(`${playerNumber} moved up`);
          socket.emit("movePlayer", {
            roomId: CurrentRoom,
            player: playerNumber,
            direction: "up",
          });
          break;
        case "ArrowDown":
          console.log(`${playerNumber} moved down`);
          socket.emit("movePlayer", {
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

function pauseGame(roomId) {
  if (isGameRunning && !isPaused) {
    // Check if the game is running and not already paused
    socket.emit("pauseGame", roomId);
    isPaused = true; // Update isPaused flag
    message.innerText = "Game is Paused..."; // Update message
  }
}

function resumeGame(roomId) {
  if (isGameRunning && isPaused) {
    // Check if the game is running and paused
    socket.emit("resumeGame", roomId);
    isPaused = false; // Update isPaused flag
    message.innerText = "Game is Resumed...";
  }
}

socket.on("gamePaused", () => {
  isPaused = true;
});

socket.on("gameResumed", () => {
  isPaused = false;
});

socket.on("matchCancelled", (why) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  message.innerText = why.reason;
});

socket.on("gameEnded", (data) => {
  isGameRunning = false; // Update game running status
  isPaused = false; // Reset pause status
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
  if (data.winner) {
    message.innerText = `Game Over! Winner: ${data.winner}`;
  } else {
    message.innerText = `Game ended: ${data.reason}`;
  }
});

// Event listener for "gameStateUpdate" event
socket.on("gameStateUpdate", (gameState) => {
  if (isGameRunning && !isPaused) {
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
