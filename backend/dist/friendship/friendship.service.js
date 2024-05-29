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
exports.FriendshipService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const client_1 = require("@prisma/client");
const res_friends_dto_1 = require("./dto/res-friends.dto");
const profile_dto_1 = require("./dto/profile.dto");
let FriendshipService = class FriendshipService {
    constructor(databaseservice) {
        this.databaseservice = databaseservice;
    }
    async addFriend(add_friendDto, userId) {
        console.log(add_friendDto.friendId, ' ', userId);
        if (add_friendDto.friendId === userId) {
            throw new common_1.HttpException('userd id is the same as firend id', common_1.HttpStatus.FORBIDDEN);
        }
        const friendshipId = `${userId}+${add_friendDto.friendId}`;
        const friends = await this.databaseservice.friendship.upsert({
            where: {
                id: friendshipId,
            },
            create: {
                id: friendshipId,
                from: {
                    connect: {
                        userId,
                    },
                },
                to: {
                    connect: {
                        userId: add_friendDto.friendId,
                    },
                },
                status: client_1.$Enums.FriendshipStatus.PENDING,
            },
            update: {},
        });
        const responseOfReq = new res_friends_dto_1.res_friendship(friends);
        return responseOfReq;
    }
    async blockedUsers(userId) {
        const blocked = await this.databaseservice.blockedUser.findMany({
            where: {
                blockedBy: userId,
            },
            select: {
                blockedId: {
                    select: {
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });
        return blocked.map((friend) => new profile_dto_1.profile(friend.blockedId));
    }
    async acceptReq(userId, friendId) {
        if (userId === friendId) {
            throw new common_1.HttpException('userd id is the same as firend id', common_1.HttpStatus.FORBIDDEN);
        }
        const request = await this.databaseservice.friendship.findMany({
            where: {
                OR: [{ id: `${userId}+${friendId}` }, { id: `${friendId}+${userId}` }],
            },
        });
        if (!request) {
            throw new common_1.HttpException('', common_1.HttpStatus.NOT_FOUND);
        }
        const result = await this.databaseservice.friendship.updateMany({
            where: {
                OR: [{ id: `${userId}+${friendId}` }, { id: `${friendId}+${userId}` }],
            },
            data: {
                status: client_1.$Enums.FriendshipStatus.ACCEPTED,
            },
        });
        return new res_friends_dto_1.res_friendship(result);
    }
    async isFriend(userId, friendId) {
        if (userId === friendId) {
            throw new common_1.HttpException('userd id is the same as firend id', common_1.HttpStatus.FORBIDDEN);
        }
        const request1 = await this.databaseservice.friendship.findFirst({
            where: {
                OR: [{ id: `${userId}+${friendId}` }, { id: `${friendId}+${userId}` }],
                status: client_1.$Enums.FriendshipStatus.ACCEPTED,
            },
        });
        return !!request1;
    }
    async rejectFriend(userId, friendId) {
        if (userId === friendId) {
            throw new common_1.HttpException('userd id is the same as firend id', common_1.HttpStatus.FORBIDDEN);
        }
        await this.databaseservice.friendship.deleteMany({
            where: {
                OR: [{ id: `${userId}+${friendId}` }, { id: `${friendId}+${userId}` }],
            },
        });
        return { send: 'done' };
    }
    async friendList(userId) {
        const friends = await this.databaseservice.friendship.findMany({
            where: {
                OR: [
                    {
                        fromUser: userId,
                        status: client_1.$Enums.FriendshipStatus.ACCEPTED,
                    },
                    {
                        toUser: userId,
                        status: client_1.$Enums.FriendshipStatus.ACCEPTED,
                    },
                ],
            },
            select: {
                from: {
                    select: {
                        userId: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                to: {
                    select: {
                        userId: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });
        return friends.map((friend) => {
            if (friend.from.userId === userId) {
                return new profile_dto_1.profile(friend.to);
            }
            return new profile_dto_1.profile(friend.from);
        });
    }
    async pendingList(userId) {
        const friends = await this.databaseservice.friendship.findMany({
            where: {
                toUser: userId,
                status: client_1.$Enums.FriendshipStatus.PENDING,
            },
            select: {
                from: {
                    select: {
                        userId: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });
        return friends.map((friend) => new profile_dto_1.profile(friend.from));
    }
    async sentList(userId) {
        const friends = await this.databaseservice.friendship.findMany({
            where: {
                fromUser: userId,
                status: client_1.$Enums.FriendshipStatus.PENDING,
            },
            select: {
                to: {
                    select: {
                        userId: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });
        return friends.map((friend) => new profile_dto_1.profile(friend.to));
    }
    async blockUser(userId, friendId) {
        console.log(userId, ' block ', friendId);
        if (userId === friendId) {
            throw new common_1.HttpException('User id is the same as friend id', common_1.HttpStatus.FORBIDDEN);
        }
        const existingBlock = await this.databaseservice.blockedUser.findFirst({
            where: {
                OR: [
                    {
                        blockedBy: userId,
                        blocked: friendId,
                    },
                    {
                        blockedBy: friendId,
                        blocked: userId,
                    },
                ],
            },
        });
        if (existingBlock) {
            if (existingBlock.blockedBy === userId) {
                throw new common_1.HttpException('This user is already blocked', common_1.HttpStatus.BAD_REQUEST);
            }
            else {
                throw new common_1.HttpException('This user has already blocked you', common_1.HttpStatus.BAD_REQUEST);
            }
        }
        await this.databaseservice.friendship.deleteMany({
            where: {
                OR: [{ id: `${userId}+${friendId}` }, { id: `${friendId}+${userId}` }],
            },
        });
        const commonRoom = await this.databaseservice.chatRoom.findFirst({
            where: {
                type: client_1.$Enums.ChatRoomType.Dm,
                members: {
                    every: {
                        id: {
                            in: [userId, friendId],
                        },
                    },
                },
            },
        });
        await this.databaseservice.blockedUser.create({
            data: {
                blocked: friendId,
                blockedBy: userId,
                dmId: commonRoom?.id,
            },
        });
        return { send: 'done' };
    }
    async unblockUser(userId, friendId) {
        console.log(userId, ' unblock ', friendId);
        if (userId === friendId) {
            throw new common_1.HttpException('userd id is the same as firend id', common_1.HttpStatus.FORBIDDEN);
        }
        await this.databaseservice.blockedUser.deleteMany({
            where: {
                AND: [{ blockedBy: userId }, { blocked: friendId }],
            },
        });
        return { send: 'done' };
    }
};
exports.FriendshipService = FriendshipService;
exports.FriendshipService = FriendshipService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], FriendshipService);
//# sourceMappingURL=friendship.service.js.map