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
exports.MessageService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const client_1 = require("@prisma/client");
let MessageService = class MessageService {
    constructor(database) {
        this.database = database;
    }
    async create(roomId, senderId, createMessageDto) {
        const chatroom = await this.database.chatRoom.findUnique({
            where: {
                id: roomId,
            },
            select: {
                ownerId: true,
                type: true,
                members: {
                    where: {
                        memberID: senderId,
                    },
                },
            },
        });
        if (!chatroom) {
            return new common_1.HttpException('Room not found', 404);
        }
        if (chatroom.type === client_1.ChatRoomType.Dm) {
            const isBlocked = await this.database.blockedUser.findFirst({
                where: {
                    dmId: roomId,
                },
            });
            if (isBlocked) {
                return new common_1.HttpException('You are blocked', 403);
            }
        }
        const roomMember = chatroom.members[0];
        if (!roomMember) {
            return new common_1.HttpException('You are not a member of this room', 403);
        }
        if (roomMember.isBanned) {
            return new common_1.HttpException('You are banned', 403);
        }
        if (roomMember.isMuted) {
            if (roomMember.muted_exp && roomMember.muted_exp > new Date()) {
                return new common_1.HttpException('You are muted', 403);
            }
        }
        await this.database.chatRoomMember.update({
            where: {
                id: roomMember.id,
            },
            data: {
                isMuted: false,
                muted_exp: null,
            },
        });
        const message = await this.database.message.create({
            data: {
                authorId: senderId,
                chatRoomId: roomId,
                content: createMessageDto.content,
            },
        });
    }
    async findAll(userId, roomId) {
    }
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], MessageService);
//# sourceMappingURL=message.service.js.map