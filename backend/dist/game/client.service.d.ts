import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { DatabaseService } from '../database/database.service';
interface User {
    userId: string;
}
export declare class ClientService {
    private readonly jwtService;
    private readonly database;
    constructor(jwtService: JwtService, database: DatabaseService);
    checkClientAccess(client: Socket): Promise<User>;
    private verifyClient;
    private findUser;
}
export {};
