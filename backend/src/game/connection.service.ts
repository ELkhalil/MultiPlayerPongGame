import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UserStatus } from './enums/user-status.enum';

@Injectable()
export class ConnectionService {
  private usersSocketsMap: Map<string, Socket> = new Map();
  private usersSocketsIds: Map<string, string> = new Map();
  private usersStatus: Map<string, UserStatus> = new Map();

  addUserSocket(userId: string, socket: Socket) {
    this.usersSocketsMap.set(userId, socket);
    this.usersSocketsIds.set(socket.id, userId);
    this.usersStatus.set(userId, UserStatus.ONLINE);
  }

  removeUserSocket(userId: string) {
    this.usersSocketsIds.delete(this.getSocketByUserId(userId).id);
    this.usersSocketsMap.delete(userId);
    this.usersStatus.delete(userId);
  }

  getUserBySocketId(socketId: string) {
    const userId = this.usersSocketsIds.get(socketId);
    return userId;
  }

  getSocketByUserId(userId: string): Socket | undefined {
    return this.usersSocketsMap.get(userId);
  }

  /* User Status Methods */
  getUserStatus(userId: string) {
    return this.usersStatus.get(userId);
  }

  updateUserStatus(userId: string, newStatus: UserStatus) {
    if (this.usersStatus.has(userId)) {
      this.usersStatus.set(userId, newStatus);
    }
  }

  /* fot debugging propose to check live values */
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
}
