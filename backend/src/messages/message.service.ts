import { HttpException, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { DatabaseService } from 'src/database/database.service';
import { ChatRoomType } from '@prisma/client';

@Injectable()
export class MessageService {
  constructor(private database: DatabaseService) {}
  async create(
    roomId: string,
    senderId: string,
    createMessageDto: CreateMessageDto,
  ) {
    const chatroom = await this.database.chatRoom.findUnique({
      where: {
        id: roomId,
      },
      select: {
        ownerId: true,
        type: true,
        members: {
          where: {
            memberID: senderId,
          },
        },
      },
    });
    if (!chatroom) {
      return new HttpException('Room not found', 404);
    }
    if (chatroom.type === ChatRoomType.Dm) {
      const isBlocked = await this.database.blockedUser.findFirst({
        where: {
          dmId: roomId,
        },
      });
      if (isBlocked) {
        return new HttpException('You are blocked', 403);
      }
    }
    const roomMember = chatroom.members[0];
    if (!roomMember) {
      return new HttpException('You are not a member of this room', 403);
    }
    if (roomMember.isBanned) {
      return new HttpException('You are banned', 403);
    }
    if (roomMember.isMuted) {
      if (roomMember.muted_exp && roomMember.muted_exp > new Date()) {
        return new HttpException('You are muted', 403);
      }
    }
    await this.database.chatRoomMember.update({
      where: {
        id: roomMember.id,
      },
      data: {
        isMuted: false,
        muted_exp: null,
      },
    });
    const message = await this.database.message.create({
      data: {
        authorId: senderId,
        chatRoomId: roomId,
        content: createMessageDto.content,
      },
    });
  }

  async findAll(userId: string, roomId: string) {
  }
}
