import { Socket } from 'socket.io';
import { UserStatus } from './enums/user-status.enum';
export declare class ConnectionService {
    private usersSocketsMap;
    private usersSocketsIds;
    private usersStatus;
    addUserSocket(userId: string, socket: Socket): void;
    removeUserSocket(userId: string): void;
    getUserBySocketId(socketId: string): string;
    getSocketByUserId(userId: string): Socket | undefined;
    getUserStatus(userId: string): UserStatus;
    updateUserStatus(userId: string, newStatus: UserStatus): void;
    dataLogger(): void;
}
