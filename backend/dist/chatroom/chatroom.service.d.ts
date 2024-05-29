import { HttpException } from '@nestjs/common';
import { CreateChatroomDto } from './dto/create-chatroom.dto';
import { DatabaseService } from 'src/database/database.service';
import { RoomDetailsDto } from './dto/roomDetails.dto';
export declare class ChatroomService {
    private databaseservice;
    constructor(databaseservice: DatabaseService);
    create(createChatroomDto: CreateChatroomDto, userOwner: string): Promise<HttpException | RoomDetailsDto>;
    getChatrooms(userId: string): Promise<RoomDetailsDto[]>;
}
