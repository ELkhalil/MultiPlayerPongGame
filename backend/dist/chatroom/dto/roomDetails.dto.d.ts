import { ChatRoom } from "@prisma/client";
export declare class RoomDetailsDto {
    constructor(data: ChatRoom);
    roomType: string;
    secondUser: string;
    time: Date;
}
