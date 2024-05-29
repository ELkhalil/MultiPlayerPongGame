export const SOCKET_EVENT = {
  /* CONNECTION EVENTS */
  NO_ACCESS: 'noAccess',
  INVALID_TOKEN: 'invalidToken',
  RECOGNITION: 'ServerRecognitionError',
  USER_NOT_FOUND: 'userNotFound',
  CONNECTION_SUCCESS: 'connectionSetupComplete',
  CONNECTION_FAILED: 'connectionSetupFailed',

  /* QUEUE EVENTS */
  VERIFYING_STATUS: 'verifyingStatus',
  STATUS_NOT_FOUND: 'noStatus',
  USER_IN_MATCHMAKING: 'InMatchMaking',
  USER_WAITING_GAME: 'WaitingGame',
  USER_IN_COUNTDOWN: 'InCountDown',
  USER_IN_GAME: 'InGame',
  STATUS_VERIFIED: 'statusVerified',
  UPDATING_USER_STATUS: 'updatingYourStatus',
  USER_IN_QUEUE: 'youAreInWaitingQueue',

  /* MATCHED EVENTS */
  USER_MATCHED: 'MatchFound',
  USER_QUEUE_UPDATE: 'queueStatus',

  /* STARTING GAME EVENTS */
  INIT_GAME: 'initializedGame',
  STARTING_GAME: 'starting',

  /* LEAVING QUEUE EVENTS */
  UN_INIT_CONNECTION: 'uninitializedConnection',

  /* USER DISCONNECTED EVENTS */
  NOT_ENOUGH_PLAYERS: 'onlyOnePlayerLeft',
  OPPONENT_DISCONNECT: 'opponentDisconnected',
  MATCH_CANCELLED: 'matchCanceledBeforeStaring',

  /* ON_GOING GAME EVENTS */
  GAME_UPDATES: 'gameStateUpdate',
  ENDING_GAME: 'endingGame',
  GAME_END: 'gameEnded',
};

export const SOCKET_ERROR = {
  /* CONNECTION EVENTS ERRORS*/
  NO_ACCESS_ERR: `Sorry! You don't have access to this resource`,
  INVALID_TOKEN_ERR: `'Sorry! the token you are using is invalid or expired'`,
  RECOGNITION_ERROR: `Server Failed to decode the userId`,
  NOT_FOUND_ERR: `Sorry! We could not recognize you!`,
  CONNECTION_FAILURE_ERR: 'failed connecting to the server',

  /* QUEUE EVENTS ERRORS */
  STATUS_NOT_FOUND_ERR:
    'Server could not find your current status in our records',
  DUP_MATCHMAKING_ERR: `'Sorry! you are allowed to join matchmaking only one time'`,
  DUP_WAITING_GAME_ERR: 'Sorry! you are already matched in another window',
  DUP_COUNTDOWN: 'Sorry! you have another game about to start',
  DUP_IN_GAME: 'Sorry! you already have another game going in another window',

  /* LEAVING QUEUE EVENTS ERRORS */
  UN_INIT_CONNECTION_ERR: 'Sorry! Unauthorized or uninitialized connection.',

  /* USER DISCONNECTED ERRORS */
  NOT_ENOUGH_PLAYERS_ERR: 'Not enough players in the room',
  OPPONENT_DISCONNECT: 'your opponent left the game.',
};
