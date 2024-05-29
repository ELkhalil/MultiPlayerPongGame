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
exports.ClientService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const database_service_1 = require("../database/database.service");
const socket_constants_1 = require("./constants/socket.constants");
const errors_messages_1 = require("./constants/errors.messages");
let ClientService = class ClientService {
    constructor(jwtService, database) {
        this.jwtService = jwtService;
        this.database = database;
    }
    async checkClientAccess(client) {
        const accessToken = client.handshake.auth.token;
        if (!accessToken) {
            client.emit(socket_constants_1.SOCKET_EVENT.NO_ACCESS, {
                message: socket_constants_1.SOCKET_ERROR.NO_ACCESS_ERR,
            });
            client.disconnect();
            throw new websockets_1.WsException(errors_messages_1.ERROR.NO_ACCESS_TOKEN);
        }
        return await this.verifyClient(client, accessToken);
    }
    async verifyClient(client, token) {
        try {
            const decoded = this.jwtService.verify(token);
            if (decoded) {
                const user = await this.findUser(client, decoded.sub);
                return user;
            }
        }
        catch (error) {
            client.emit(socket_constants_1.SOCKET_EVENT.INVALID_TOKEN, {
                message: socket_constants_1.SOCKET_ERROR.INVALID_TOKEN_ERR,
            });
            client.disconnect();
            throw new websockets_1.WsException(errors_messages_1.ERROR.INVALID_ACCESS_TOKEN);
        }
    }
    async findUser(client, userId) {
        if (!userId) {
            client.emit(socket_constants_1.SOCKET_EVENT.RECOGNITION, {
                message: socket_constants_1.SOCKET_ERROR.RECOGNITION_ERROR,
            });
            client.disconnect();
            throw new websockets_1.WsException(errors_messages_1.ERROR.FAIL_DECODE_TOKEN);
        }
        const user = await this.database.user.findUnique({
            where: { userId: userId },
            select: {
                userId: true,
            },
        });
        if (!user || !user.userId || user.userId === '') {
            client.emit(socket_constants_1.SOCKET_EVENT.USER_NOT_FOUND, {
                message: socket_constants_1.SOCKET_ERROR.NOT_FOUND_ERR,
            });
            client.disconnect();
            throw new websockets_1.WsException(errors_messages_1.ERROR.NOT_FOUND);
        }
        return user;
    }
};
exports.ClientService = ClientService;
exports.ClientService = ClientService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        database_service_1.DatabaseService])
], ClientService);
//# sourceMappingURL=client.service.js.map