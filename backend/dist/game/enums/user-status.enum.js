"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = void 0;
var UserStatus;
(function (UserStatus) {
    UserStatus[UserStatus["ONLINE"] = 0] = "ONLINE";
    UserStatus[UserStatus["IN_MATCHMAKING"] = 1] = "IN_MATCHMAKING";
    UserStatus[UserStatus["MATCHED"] = 2] = "MATCHED";
    UserStatus[UserStatus["WAITING_GAME"] = 3] = "WAITING_GAME";
    UserStatus[UserStatus["COUNTDOWN"] = 4] = "COUNTDOWN";
    UserStatus[UserStatus["IN_GAME"] = 5] = "IN_GAME";
    UserStatus[UserStatus["FINISHED_GAME"] = 6] = "FINISHED_GAME";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
//# sourceMappingURL=user-status.enum.js.map