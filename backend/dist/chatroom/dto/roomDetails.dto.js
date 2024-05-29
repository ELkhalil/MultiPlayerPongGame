"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomDetailsDto = void 0;
class RoomDetailsDto {
    constructor(data) {
        this.roomType = data.type;
        this.secondUser = data.ownerId;
        this.time = data.createdAt;
    }
}
exports.RoomDetailsDto = RoomDetailsDto;
//# sourceMappingURL=roomDetails.dto.js.map