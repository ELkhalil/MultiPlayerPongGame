import { HttpException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { DatabaseService } from 'src/database/database.service';
export declare class MessageService {
    private database;
    constructor(database: DatabaseService);
    create(roomId: string, senderId: string, createMessageDto: CreateMessageDto): Promise<HttpException>;
    findAll(userId: string, roomId: string): Promise<void>;
}
