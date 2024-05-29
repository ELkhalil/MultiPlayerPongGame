"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatroomController = void 0;
const common_1 = require("@nestjs/common");
const chatroom_service_1 = require("./chatroom.service");
const create_chatroom_dto_1 = require("./dto/create-chatroom.dto");
const swagger_1 = require("@nestjs/swagger");
const access_guard_1 = require("../auth/Guards/access.guard");
const getCurrentUser_decorator_1 = require("../auth/decorators/getCurrentUser.decorator");
let ChatroomController = class ChatroomController {
    constructor(chatroomService) {
        this.chatroomService = chatroomService;
    }
    async create(createChatroomDto, userOwner) {
        return this.chatroomService.create(createChatroomDto, userOwner);
    }
    async getChatrooms(userId) {
        return this.chatroomService.getChatrooms(userId);
    }
};
exports.ChatroomController = ChatroomController;
__decorate([
    (0, common_1.UseGuards)(access_guard_1.AtGuard),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, getCurrentUser_decorator_1.GetCurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_chatroom_dto_1.CreateChatroomDto, String]),
    __metadata("design:returntype", Promise)
], ChatroomController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(access_guard_1.AtGuard),
    (0, common_1.Get)('getAllRooms'),
    __param(0, (0, getCurrentUser_decorator_1.GetCurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatroomController.prototype, "getChatrooms", null);
exports.ChatroomController = ChatroomController = __decorate([
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, common_1.Controller)('chatroom'),
    __metadata("design:paramtypes", [chatroom_service_1.ChatroomService])
], ChatroomController);
//# sourceMappingURL=chatroom.controller.js.map