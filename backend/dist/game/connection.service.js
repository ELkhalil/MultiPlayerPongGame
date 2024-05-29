"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionService = void 0;
const common_1 = require("@nestjs/common");
const user_status_enum_1 = require("./enums/user-status.enum");
let ConnectionService = class ConnectionService {
    constructor() {
        this.usersSocketsMap = new Map();
        this.usersSocketsIds = new Map();
        this.usersStatus = new Map();
    }
    addUserSocket(userId, socket) {
        this.usersSocketsMap.set(userId, socket);
        this.usersSocketsIds.set(socket.id, userId);
        this.usersStatus.set(userId, user_status_enum_1.UserStatus.ONLINE);
    }
    removeUserSocket(userId) {
        this.usersSocketsIds.delete(this.getSocketByUserId(userId).id);
        this.usersSocketsMap.delete(userId);
        this.usersStatus.delete(userId);
    }
    getUserBySocketId(socketId) {
        const userId = this.usersSocketsIds.get(socketId);
        return userId;
    }
    getSocketByUserId(userId) {
        return this.usersSocketsMap.get(userId);
    }
    getUserStatus(userId) {
        return this.usersStatus.get(userId);
    }
    updateUserStatus(userId, newStatus) {
        if (this.usersStatus.has(userId)) {
            this.usersStatus.set(userId, newStatus);
        }
    }
    dataLogger() {
        console.log('-----------data Logger check------------');
        console.log('Users Sockets Map:');
        this.usersSocketsMap.forEach((socket, userId) => {
            console.log(`UserId: ${userId}, SocketId: ${socket?.id}`);
        });
        console.log('Users Sockets IDs:');
        this.usersSocketsIds.forEach((userId, socketId) => {
            console.log(`SocketId: ${socketId}, UserId: ${userId}`);
        });
        console.log('Users Status:');
        this.usersStatus.forEach((status, userId) => {
            console.log(`UserId: ${userId}, Status: ${status}`);
        });
        console.log('--------------------------------------');
    }
};
exports.ConnectionService = ConnectionService;
exports.ConnectionService = ConnectionService = __decorate([
    (0, common_1.Injectable)()
], ConnectionService);
//# sourceMappingURL=connection.service.js.map