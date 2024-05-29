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
exports.ChatroomService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const database_service_1 = require("../database/database.service");
const client_1 = require("@prisma/client");
const roomDetails_dto_1 = require("./dto/roomDetails.dto");
let ChatroomService = class ChatroomService {
    constructor(databaseservice) {
        this.databaseservice = databaseservice;
    }
    async create(createChatroomDto, userOwner) {
        if (createChatroomDto.type === client_1.ChatRoomType.Dm &&
            !createChatroomDto.secondUser) {
            return new common_1.HttpException('Second user is required for dm chatrooms', 400);
        }
        else if (createChatroomDto.type === client_1.ChatRoomType.Dm &&
            createChatroomDto.secondUser === userOwner) {
            return new common_1.HttpException('You cannot create a dm chatroom with yourself', 400);
        }
        if (createChatroomDto.type === 'protected' &&
            createChatroomDto.password) {
            createChatroomDto.password = await bcrypt.hash(createChatroomDto.password, 10);
        }
        const user = await this.databaseservice.user.findUnique({
            where: {
                userId: userOwner,
            },
        });
        if (!user) {
            return new common_1.HttpException('User not found', 404);
        }
        if (createChatroomDto.type === client_1.ChatRoomType.Dm &&
            userOwner == createChatroomDto.secondUser) {
            return new common_1.HttpException('You cannot create a dm chatroom with yourself', 400);
        }
        const existingBlock = await this.databaseservice.blockedUser.findFirst({
            where: {
                OR: [
                    {
                        blockedBy: userOwner,
                        blocked: createChatroomDto.secondUser,
                    },
                    {
                        blockedBy: createChatroomDto.secondUser,
                        blocked: userOwner,
                    },
                ],
            },
        });
        if (existingBlock) {
            return new common_1.HttpException('User is blocked', 403);
        }
        const ifChatroomExists = await this.databaseservice.chatRoom.findFirst({
            where: {
                type: client_1.ChatRoomType.Dm,
                members: {
                    every: {
                        id: {
                            in: [userOwner, createChatroomDto.secondUser],
                        },
                    },
                },
            },
        });
        if (ifChatroomExists) {
            return new common_1.HttpException('Chatroom already exists', 400);
        }
        const room = await this.databaseservice.chatRoom.create({
            data: {
                type: createChatroomDto.type,
                owner: {
                    connect: { userId: userOwner },
                },
            },
        });
        await this.databaseservice.chatRoomMember.create({
            data: {
                member: {
                    connect: { userId: userOwner },
                },
                ChatRoom: {
                    connect: { id: room.id },
                },
                isAdmin: true,
            },
        });
        if (createChatroomDto.type === client_1.ChatRoomType.Dm) {
            await this.databaseservice.chatRoomMember.create({
                data: {
                    member: {
                        connect: { userId: createChatroomDto.secondUser },
                    },
                    ChatRoom: {
                        connect: { id: room.id },
                    },
                    isAdmin: true,
                },
            });
        }
        return new roomDetails_dto_1.RoomDetailsDto(room);
    }
    async getChatrooms(userId) {
        const chatrooms = await this.databaseservice.chatRoom.findMany({
            where: {
                members: {
                    some: {
                        id: userId,
                    },
                },
            },
        });
        return chatrooms.map((room) => new roomDetails_dto_1.RoomDetailsDto(room));
    }
};
exports.ChatroomService = ChatroomService;
exports.ChatroomService = ChatroomService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ChatroomService);
//# sourceMappingURL=chatroom.service.js.map