import { ChatRoomType } from '@prisma/client';
export declare class CreateChatroomDto {
    roomName: string;
    type: ChatRoomType;
    password: string;
    secondUser: string;
}
