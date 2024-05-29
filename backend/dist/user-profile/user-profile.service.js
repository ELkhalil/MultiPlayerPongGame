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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileService = void 0;
const users_service_1 = require("./../users/users.service");
const common_1 = require("@nestjs/common");
const UserProfile_dto_1 = require("./dto/UserProfile.dto");
const database_service_1 = require("../database/database.service");
let UserProfileService = class UserProfileService {
    constructor(databaseservice, UsersService) {
        this.databaseservice = databaseservice;
        this.UsersService = UsersService;
    }
    async getMyProfile(userId) {
        const currentuser = await this.UsersService.getUserById(userId);
        if (!currentuser) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        const wonGamesNumber = 0;
        return new UserProfile_dto_1.UserProfileDto({ ...currentuser, wonGamesNumber }, false);
    }
};
exports.UserProfileService = UserProfileService;
exports.UserProfileService = UserProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        users_service_1.UsersService])
], UserProfileService);
//# sourceMappingURL=user-profile.service.js.map