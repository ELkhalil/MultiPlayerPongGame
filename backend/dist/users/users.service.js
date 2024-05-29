"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const database_service_1 = require("../database/database.service");
let UsersService = class UsersService {
    constructor(DatabaseService) {
        this.DatabaseService = DatabaseService;
    }
    async createUser(createUserDto) {
        return this.DatabaseService.user.create({
            data: {
                ...createUserDto,
                userLevel: 4,
            },
        });
    }
    async update(userId, udateuserDto) {
        return this.DatabaseService.user.update({
            where: {
                userId: userId,
            },
            data: udateuserDto,
        });
    }
    async getAllUsers() {
        return this.DatabaseService.user.findMany();
    }
    async getUserById(id) {
        return this.DatabaseService.user.findUnique({
            where: {
                userId: id,
            },
        });
    }
    async getUserByUsername(username) {
        return this.DatabaseService.user.findUnique({
            where: {
                username: username,
            },
        });
    }
    async getUserByEmail(email) {
        return this.DatabaseService.user.findUnique({
            where: {
                email: email,
            },
        });
    }
    async updateUser(id, updateUserDto) {
        const hashPassword = await bcrypt.hash(updateUserDto.password, 10);
        return this.DatabaseService.user.update({
            where: {
                userId: id,
            },
            data: {
                username: updateUserDto.username,
                email: updateUserDto.email,
                firstName: updateUserDto.firstName,
                lastName: updateUserDto.lastName,
                avatar: updateUserDto.avatar,
                password: hashPassword,
            },
        });
    }
    async updateAvatar(id, avatar) {
        return this.DatabaseService.user.update({
            where: {
                userId: id,
            },
            data: {
                avatar: avatar,
            },
        });
    }
    async updatePassword(id, password) {
        const hashPassword = await bcrypt.hash(password, 10);
        return this.DatabaseService.user.update({
            where: {
                userId: id,
            },
            data: {
                password: hashPassword,
            },
        });
    }
    async updateUsername(id, updateUserDto) {
        return this.DatabaseService.user.update({
            where: {
                userId: id,
            },
            data: {
                username: updateUserDto.username,
            },
        });
    }
    async updateEmail(id, updateUserDto) {
        return this.DatabaseService.user.update({
            where: {
                userId: id,
            },
            data: {
                email: updateUserDto.email,
            },
        });
    }
    async updateFirstName(id, updateUserDto) {
        return this.DatabaseService.user.update({
            where: {
                userId: id,
            },
            data: {
                firstName: updateUserDto.firstName,
            },
        });
    }
    async updateLastName(id, updateUserDto) {
        return this.DatabaseService.user.update({
            where: {
                userId: id,
            },
            data: {
                lastName: updateUserDto.lastName,
            },
        });
    }
    async deleteUser(id) {
        return this.DatabaseService.user.delete({
            where: {
                userId: id,
            },
        });
    }
    async getUserByIntraId(intraId) {
        return this.DatabaseService.user.findUnique({
            where: {
                intraId: intraId,
            },
        });
    }
    async GetSearchedUsers(name, currentUserID) {
        const users = await this.DatabaseService.user.findMany({
            where: {
                OR: [
                    {
                        username: {
                            contains: name,
                            mode: 'insensitive',
                        },
                    },
                    {
                        firstName: {
                            contains: name,
                            mode: 'insensitive',
                        },
                    },
                    {
                        lastName: {
                            contains: name,
                            mode: 'insensitive',
                        },
                    },
                ],
                NOT: {
                    OR: [
                        {
                            blockedUser: {
                                some: {
                                    blocked: currentUserID,
                                },
                            },
                            blockedByUser: {
                                some: {
                                    blockedBy: currentUserID,
                                },
                            },
                        },
                    ],
                },
            },
        });
        console.log(users);
        return users.map((user) => {
            return {
                username: user.username,
                email: user.email,
                avatar: user.avatar,
            };
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map