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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const update_user_dto_1 = require("./dto/update-user.dto");
const search_user_dto_1 = require("./dto/search-user.dto");
const access_guard_1 = require("../auth/Guards/access.guard");
const getCurrentUser_decorator_1 = require("../auth/decorators/getCurrentUser.decorator");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async GetSearchedUsers(query, userId) {
        console.log(query);
        return this.usersService.GetSearchedUsers(query.name, userId);
    }
    async whoami(userId) {
        return this.usersService.getUserById(userId);
    }
    async update(req, updateUserDto) {
        const result = this.usersService.update(req.user.userId, updateUserDto);
        if (result) {
            return { message: 'User updated successfully' };
        }
        return { message: 'User update failed' };
    }
    async updatePassword(req, updateUserDto) {
        const result = this.usersService.updatePassword(req.user.userId, updateUserDto.password);
        if (result) {
            return { message: 'Password updated successfully' };
        }
        return { message: 'Password update failed' };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('search'),
    (0, common_1.UseGuards)(access_guard_1.AtGuard),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, getCurrentUser_decorator_1.GetCurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_user_dto_1.usersSearchDto, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetSearchedUsers", null);
__decorate([
    (0, common_1.UseGuards)(access_guard_1.AtGuard),
    (0, common_1.Get)(),
    __param(0, (0, getCurrentUser_decorator_1.GetCurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "whoami", null);
__decorate([
    (0, common_1.UseGuards)(access_guard_1.AtGuard),
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(access_guard_1.AtGuard),
    (0, common_1.Post)('update/password'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updatePassword", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map