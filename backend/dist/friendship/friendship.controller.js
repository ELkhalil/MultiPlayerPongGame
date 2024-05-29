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
exports.FriendshipController = void 0;
const common_1 = require("@nestjs/common");
const friendship_service_1 = require("./friendship.service");
const add_friendship_dto_1 = require("./dto/add-friendship.dto");
const access_guard_1 = require("../auth/Guards/access.guard");
const getCurrentUser_decorator_1 = require("../auth/decorators/getCurrentUser.decorator");
const isFriend_dto_1 = require("./dto/isFriend.dto");
let FriendshipController = class FriendshipController {
    constructor(friendshipService) {
        this.friendshipService = friendshipService;
    }
    async addFriend(add_friendDto, userId) {
        return this.friendshipService.addFriend(add_friendDto, userId);
    }
    async acceptReq(acceptReqDto, userId) {
        this.friendshipService.acceptReq(userId, acceptReqDto.friendId);
    }
    async rejectReq(rejectReqDto, userId) {
        console.log("hahahaha", rejectReqDto.friendId);
        this.friendshipService.rejectFriend(userId, rejectReqDto.friendId);
    }
    async blockingList(userId) {
        this.friendshipService.blockedUsers(userId);
    }
    async isFriend(quer, userId) {
        console.log(quer.friendId, ' ', userId);
        return this.friendshipService.isFriend(userId, quer.friendId);
    }
    async friendList(userId) {
        return this.friendshipService.friendList(userId);
    }
    async pendingList(userId) {
        return this.friendshipService.pendingList(userId);
    }
    async sentList(userId) {
        return this.friendshipService.sentList(userId);
    }
    async blockUser(friendId, userId) {
        return this.friendshipService.blockUser(userId, friendId.friendId);
    }
    async unblockUser(friendId, userId) {
        return this.friendshipService.unblockUser(userId, friendId.friendId);
    }
};
exports.FriendshipController = FriendshipController;
__decorate([
    (0, common_1.UseGuards)(access_guard_1.AtGuard),
    (0, common_1.Post)('add'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, getCurrentUser_decorator_1.GetCurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_friendship_dto_1.add_friendDto, String]),
    __metadata("design:returntype", Promise)
], FriendshipController.prototype, "addFriend", null);
__decorate([
    (0, common_1.UseGuards)(access_guard_1.AtGuard),
    (0, common_1.Post)('accept'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, getCurrentUser_decorator_1.GetCurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_friendship_dto_1.add_friendDto, String]),
    __metadata("design:returntype", Promise)
], FriendshipController.prototype, "acceptReq", null);
__decorate([
    (0, common_1.UseGuards)(access_guard_1.AtGuard),
    (0, common_1.Post)('reject'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, getCurrentUser_decorator_1.GetCurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_friendship_dto_1.add_friendDto, String]),
    __metadata("design:returntype", Promise)
], FriendshipController.prototype, "rejectReq", null);
__decorate([
    (0, common_1.UseGuards)(access_guard_1.AtGuard),
    (0, common_1.Post)('blockingList'),
    __param(0, (0, getCurrentUser_decorator_1.GetCurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FriendshipController.prototype, "blockingList", null);
__decorate([
    (0, common_1.UseGuards)(access_guard_1.AtGuard),
    (0, common_1.Get)('isFriend'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, getCurrentUser_decorator_1.GetCurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [isFriend_dto_1.isFriendDto, String]),
    __metadata("design:returntype", Promise)
], FriendshipController.prototype, "isFriend", null);
__decorate([
    (0, common_1.UseGuards)(access_guard_1.AtGuard),
    (0, common_1.Get)('friendList'),
    __param(0, (0, getCurrentUser_decorator_1.GetCurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FriendshipController.prototype, "friendList", null);
__decorate([
    (0, common_1.UseGuards)(access_guard_1.AtGuard),
    (0, common_1.Get)('pendingList'),
    __param(0, (0, getCurrentUser_decorator_1.GetCurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FriendshipController.prototype, "pendingList", null);
__decorate([
    (0, common_1.UseGuards)(access_guard_1.AtGuard),
    (0, common_1.Get)('sentList'),
    __param(0, (0, getCurrentUser_decorator_1.GetCurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FriendshipController.prototype, "sentList", null);
__decorate([
    (0, common_1.UseGuards)(access_guard_1.AtGuard),
    (0, common_1.Post)('block'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, getCurrentUser_decorator_1.GetCurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_friendship_dto_1.add_friendDto, String]),
    __metadata("design:returntype", Promise)
], FriendshipController.prototype, "blockUser", null);
__decorate([
    (0, common_1.UseGuards)(access_guard_1.AtGuard),
    (0, common_1.Post)('unblock/'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, getCurrentUser_decorator_1.GetCurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_friendship_dto_1.add_friendDto, String]),
    __metadata("design:returntype", Promise)
], FriendshipController.prototype, "unblockUser", null);
exports.FriendshipController = FriendshipController = __decorate([
    (0, common_1.Controller)('friendship'),
    __metadata("design:paramtypes", [friendship_service_1.FriendshipService])
], FriendshipController);
//# sourceMappingURL=friendship.controller.js.map