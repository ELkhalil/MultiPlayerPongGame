import { useNavigate } from "react-router-dom";
import { PATHS } from "../../constants/paths";
import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { SOCKET_EVENTS } from "../../constants/socketEvents";
import { ERROR, STATE } from "../../constants/errors";
import { GameState } from "../../types/GameState";
import ErrorConnection from "../ConnectionError/ConnectionError";
import LiveMode from "../LiveMode/LiveMode";
import "./MatchMaking.css";

/* TODO: Dummy token for testing */
const ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1haG1vdWRAZ21haWwuY29tIiwic3ViIjoiYmQyYzdlZGEtZDE5NS00M2ZkLTkyYTctMzZkMzMxZTRiNGMyIiwiaWF0IjoxNzE2OTg2MzM3LCJleHAiOjE3MTY5OTM1Mzd9.QnELYNC9RRchUxKCHrEh_YqPyEOP39pWaWv0t7XNodU";

export default function MatchMaking() {
  const socketRef = useRef<Socket | null>(null);
  const [matchMakingStatus, setMatchMakingStatus] = useState<string>("pending");
  const [opponent, setOpponent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerPos, setPlayerPos] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [matchStatus, setMatchStatus] = useState<string | null>(null);
  const [matchFound, setMatchFound] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io(PATHS.BACKEND_GAME_PATH, {
      transports: ["websocket"],
      auth: { token: ACCESS_TOKEN }, // TODO: change access_token
    });
    socketRef.current = socket;

    socket.on(SOCKET_EVENTS.NO_ACCESS, (error: { message: string }) => {
      setError(error.message);
      cleanUpSocket();
    });
    socket.on(SOCKET_EVENTS.INVALID_TOKEN, (error: { message: string }) => {
      setError(error.message);
      cleanUpSocket();
    });
    socket.on(
      SOCKET_EVENTS.SERVER_RECOGNITION_ERROR,
      (error: { message: string }) => {
        setError(error.message);
        cleanUpSocket();
      }
    );
    socket.on(SOCKET_EVENTS.USER_NOT_FOUND, () => {
      setError(ERROR.USER_NOT_FOUND);
      cleanUpSocket();
    });
    socket.on(SOCKET_EVENTS.STATUS_VERIFIED, () => {
      console.log(STATE.STATUS_VERIFIED);
    });
    socket.on(
      SOCKET_EVENTS.UPDATING_YOUR_STATUS,
      (data: { status: string }) => {
        console.log(`${STATE.UPDATING_STATUS} :${data.status}`);
      }
    );
    socket.on(SOCKET_EVENTS.YOU_ARE_IN_WAITING_QUEUE, () => {
      console.log(STATE.LOOKING_FOR_MATCH);
    });
    socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error: { message: string }) => {
      setError(error.message);
      cleanUpSocket();
    });
    socket.on(
      SOCKET_EVENTS.CONNECTION_SETUP_FAILED,
      (error: { message: string }) => {
        console.error(ERROR.FAILED_CONNECTING);
        setError(error.message);
        cleanUpSocket();
      }
    );
    socket.on(
      SOCKET_EVENTS.UNINITIALIZED_CONNECTION,
      (error: { message: string }) => {
        console.error(ERROR.NO_INIT_CONNECTION);
        setError(error.message);
        cleanUpSocket();
      }
    );
    socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log(STATE.CONNECTING_TO_SERVER);
    });
    socket.on(SOCKET_EVENTS.CONNECTION_SETUP_COMPLETE, () => {
      console.log(STATE.CONNECTING_SUCCESS);
      socket.emit("joinQueue");
    });
    socket.on(SOCKET_EVENTS.QUEUE_STATUS, (data: { queueStatus: string }) => {
      console.log(`${STATE.QUEUE_STATUS}: ${data.queueStatus}`);
    });
    socket.on(SOCKET_EVENTS.VERIFYING_STATUS, () => {
      console.log(STATE.VERIFYING_STATUS);
    });
    socket.on(SOCKET_EVENTS.NO_STATUS, (error: { message: string }) => {
      console.log(ERROR.NO_STATUS_FOUND);
      setError(error.message);
      cleanUpSocket();
    });
    socket.on(SOCKET_EVENTS.IN_MATCHMAKING, (error: { message: string }) => {
      console.log(STATE.ALREADY_IN_MATCHMAKING);
      setError(error.message);
      cleanUpSocket();
    });
    socket.on(SOCKET_EVENTS.IN_COUNTDOWN, (error: { message: string }) => {
      console.log(STATE.ALREADY_IN_COUNTDOWN);
      setError(error.message);
      cleanUpSocket();
    });
    socket.on(SOCKET_EVENTS.WAITING_GAME, (error: { message: string }) => {
      console.log(STATE.ALREADY_WAITING_GAME);
      setError(error.message);
      cleanUpSocket();
    });
    socket.on(SOCKET_EVENTS.IN_GAME, (error: { message: string }) => {
      console.log(STATE.ALREADY_IN_GAME);
      setError(error.message);
      cleanUpSocket();
    });
    socket.on(
      SOCKET_EVENTS.MATCH_FOUND,
      (data: { opponentUserName: string; opponentId: string }) => {
        console.log(`${STATE.MATCH_FOUND}: ${data.opponentUserName}`);
        console.log(data.opponentId);
        setOpponent(data.opponentUserName);
        setMatchFound(true);
      }
    );
    socket.on(
      SOCKET_EVENTS.INITIALIZED_GAME,
      (data: {
        roomId: string;
        playerPos: number;
        initGameState: GameState;
      }) => {
        console.log(data);
        setRoomId(data.roomId);
        setPlayerPos(data.playerPos);
        setGameState(data.initGameState);
        setMatchMakingStatus("liveGame");
      }
    );
    socket.on(
      SOCKET_EVENTS.MATCH_CANCELED_BEFORE_STARTING,
      (data: { message?: string }) => {
        setMatchStatus("matchCanceled");
        setError(ERROR.DISCONNECTION);
        if (data.message) {
          console.log(`${STATE.MATCH_CANCELLED} because: ${data.message}`);
        }
        cleanUpSocket();
      }
    );
    socket.on(
      SOCKET_EVENTS.ONLY_ONE_PLAYER_LEFT,
      (data: { reason?: string }) => {
        console.log(ERROR.NOT_ENOUGH_PLAYERS);
        if (data.reason) {
          setError(data.reason);
        }
        cleanUpSocket();
      }
    );

    return () => {
      cleanUpSocket();
    };
  }, []);

  useEffect(() => {
    if (opponent) {
      setMatchMakingStatus("matchFound");
    }
  }, [opponent]);

  useEffect(() => {
    if (roomId && playerPos && gameState) {
      setMatchMakingStatus("liveGame");
    }
  }, [roomId, playerPos, gameState]);

  if (matchStatus === "matchCanceled") {
    if (!error) return;
    return <ErrorConnection reason={error} />;
  }

  if (error) {
    return <ErrorConnection reason={error} />;
  }

  if (matchMakingStatus === "liveGame") {
    if (socketRef && opponent && roomId && playerPos && gameState) {
      return (
        <LiveMode
          socketRef={socketRef}
          opponent={opponent}
          roomId={roomId}
          playerPos={playerPos}
          gameData={gameState}
        />
      );
    }
  }

  const cleanUpSocket = () => {
    if (socketRef.current) {
      socketRef.current.off();
      socketRef.current.disconnect();
    }
  };

  const leaveMatchMaking = () => {
    cleanUpSocket();
    navigate(PATHS.DEFAULT_GAME_PAGE);
  };

  return (
    <div className="container">
      <h1 className="header">
        {matchFound
          ? "Match Found"
          : matchMakingStatus === "pending"
          ? "Finding Random Player"
          : "Connecting"}
      </h1>
      <div className="card">
        {matchFound ? (
          <>
            <p className="opponentInfo">Match Found! Opponent: {opponent}</p>
          </>
        ) : (
          <>
            <p className="statusMessage">
              {matchMakingStatus === "pending"
                ? "Looking for a match..."
                : "Connecting"}
            </p>
            <div className="spinner"></div>
          </>
        )}
        <button className="button" onClick={leaveMatchMaking}>
          Leave
        </button>
      </div>
    </div>
  );
}
