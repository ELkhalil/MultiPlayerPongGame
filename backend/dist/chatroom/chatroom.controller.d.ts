import { ChatroomService } from './chatroom.service';
import { CreateChatroomDto } from './dto/create-chatroom.dto';
export declare class ChatroomController {
    private readonly chatroomService;
    constructor(chatroomService: ChatroomService);
    create(createChatroomDto: CreateChatroomDto, userOwner: string): Promise<import("@nestjs/common").HttpException | import("./dto/roomDetails.dto").RoomDetailsDto>;
    getChatrooms(userId: string): Promise<import("./dto/roomDetails.dto").RoomDetailsDto[]>;
}
