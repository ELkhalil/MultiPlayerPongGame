"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR = void 0;
exports.ERROR = {
    NO_ACCESS_TOKEN: `tried to access without an access_token`,
    INVALID_ACCESS_TOKEN: 'tried to connect with an invalid or expired access_token',
    FAIL_DECODE_TOKEN: 'server is not able to decode this access_token',
    NOT_FOUND: 'client does not exist in our records',
    USER_NO_STATUS: 'client does not have a status',
    USER_DUP_MATCHMAKING: 'client already in another matchmaking',
    USER_DUP_IN_GAME: 'client already waiting for a game to start',
    USER_DUP_COUNTDOWN: 'client already in countdown in another game',
    USER_DUP_GAME: 'client already playing another game',
    SOCKET_NOT_FOUND: 'Error finding sockets for players',
};
//# sourceMappingURL=errors.messages.js.map