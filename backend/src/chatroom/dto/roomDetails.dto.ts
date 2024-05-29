import { ChatRoom } from "@prisma/client";

export class RoomDetailsDto {
    constructor(data: ChatRoom) {
        this.roomType = data.type;
        this.secondUser = data.ownerId;
        this.time = data.createdAt;
    }
  roomType: string;
  secondUser: string;
  time: Date;
}