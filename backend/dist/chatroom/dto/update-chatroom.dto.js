"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateChatroomDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_chatroom_dto_1 = require("./create-chatroom.dto");
class UpdateChatroomDto extends (0, swagger_1.PartialType)(create_chatroom_dto_1.CreateChatroomDto) {
}
exports.UpdateChatroomDto = UpdateChatroomDto;
//# sourceMappingURL=update-chatroom.dto.js.map