export const ERROR = {
  USER_NOT_FOUND: "User not found",
  NO_STATUS_FOUND: "Server failed to find your status in its records",
  FAILED_CONNECTING: "Failed at the connection process",
  NO_INIT_CONNECTION: "Looks like you did not setup an initial connection",
  DISCONNECTION: "Opponent Disconnected!",
  NOT_ENOUGH_PLAYERS: "Not enough players in the room",
};

export const STATE = {
  CONNECTING_TO_SERVER: "Connecting to server...",
  CONNECTING_SUCCESS: "Successfully setup a connection to server",

  VERIFYING_STATUS: "Server is verifying your status...",
  UPDATING_STATUS: "Server is updating your status:",
  STATUS_VERIFIED: "Server verified your current status",

  ALREADY_IN_MATCHMAKING:
    "Looks like you already have another matchmaking ongoing",
  ALREADY_IN_COUNTDOWN:
    "Looks like you already have another game about to start",
  ALREADY_WAITING_GAME:
    "Sorry, you are already close to starting a game in another window",
  ALREADY_IN_GAME:
    "Sorry! You already have another game going in another window",
  LOOKING_FOR_MATCH: "Looking for a match...",
  QUEUE_STATUS: "Current players in Queue",
  MATCH_FOUND: "Match found... you are playing against:",
  MATCH_CANCELLED: "Sorry The Match is Canceled",
};
