export const SOCKET_EVENTS = {
  /* Connection events */
  CONNECT_ERROR: "connect_error",
  CONNECT: "connect",

  /* Authentication and access events */
  NO_ACCESS: "noAccess",
  INVALID_TOKEN: "invalidToken",

  /* Server recognition and user status */
  SERVER_RECOGNITION_ERROR: "ServerRecognitionError",
  USER_NOT_FOUND: "userNotFound",
  UNINITIALIZED_CONNECTION: "uninitializedConnection",

  /* Connection setup events */
  CONNECTION_SETUP_COMPLETE: "connectionSetupComplete",
  CONNECTION_SETUP_FAILED: "connectionSetupFailed",

  /* Status verification events */
  VERIFYING_STATUS: "verifyingStatus",
  NO_STATUS: "noStatus",
  STATUS_VERIFIED: "statusVerified",

  /* Matchmaking and game state events */
  IN_MATCHMAKING: "InMatchMaking",
  WAITING_GAME: "WaitingGame",
  IN_COUNTDOWN: "InCountDown",
  IN_GAME: "InGame",
  UPDATING_YOUR_STATUS: "updatingYourStatus",
  YOU_ARE_IN_WAITING_QUEUE: "youAreInWaitingQueue",
  QUEUE_STATUS: "queueStatus",
  MATCH_FOUND: "MatchFound",
  INITIALIZED_GAME: "initializedGame",
  MATCH_CANCELED_BEFORE_STARTING: "matchCanceledBeforeStaring",
  ONLY_ONE_PLAYER_LEFT: "onlyOnePlayerLeft",
  OPPONENT_DISCONNECT: "opponentDisconnected",

  /* Game lifecycle events */
  STARTING_GAME: "starting",
  GAME_UPDATES: "gameStateUpdate",
  ENDING_GAME: "endingGame",
  GAME_END: "gameEnded",
};
