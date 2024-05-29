import { HttpException, Injectable } from '@nestjs/common';
import { CreateChatroomDto } from './dto/create-chatroom.dto';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from 'src/database/database.service';
import { ChatRoomType } from '@prisma/client';
import { RoomDetailsDto } from './dto/roomDetails.dto';
@Injectable()
export class ChatroomService {
  constructor(private databaseservice: DatabaseService) {}
  async create(createChatroomDto: CreateChatroomDto, userOwner: string) {
    // Check if required parameters are provided
    if (
      createChatroomDto.type === ChatRoomType.Dm &&
      !createChatroomDto.secondUser
    ) {
      return new HttpException('Second user is required for dm chatrooms', 400);
    } else if (
      createChatroomDto.type === ChatRoomType.Dm &&
      createChatroomDto.secondUser === userOwner
    ) {
      return new HttpException(
        'You cannot create a dm chatroom with yourself',
        400,
      );
    }
    // Check if password is provided for protected chatrooms and hash it
    if (
      createChatroomDto.type === 'protected' &&
      createChatroomDto.password
    ) {
      createChatroomDto.password = await bcrypt.hash(
        createChatroomDto.password,
        10,
      );
    }
    // Check if the user exists
    const user = await this.databaseservice.user.findUnique({
      where: {
        userId: userOwner,
      },
    });
    if (!user) {
      return new HttpException('User not found', 404);
    }
    // Check if user is trying to create a dm chatroom with themselves
    if (
      createChatroomDto.type === ChatRoomType.Dm &&
      userOwner == createChatroomDto.secondUser
    ) {
      return new HttpException(
        'You cannot create a dm chatroom with yourself',
        400,
      );
    }
    // Check if user is blocked by the other user
    const existingBlock = await this.databaseservice.blockedUser.findFirst({
      where: {
        OR: [
          {
            blockedBy: userOwner,
            blocked: createChatroomDto.secondUser,
          },
          {
            blockedBy: createChatroomDto.secondUser,
            blocked: userOwner,
          },
        ],
      },
    });

    if (existingBlock) {
      return new HttpException('User is blocked', 403);
    }

    // Check if the chatroom already exists
    const ifChatroomExists = await this.databaseservice.chatRoom.findFirst({
      where: {
        type: ChatRoomType.Dm,
        members: {
          every: {
            id: {
              in: [userOwner, createChatroomDto.secondUser],
            },
          },
        },
      },
    });
    if (ifChatroomExists) {
      return new HttpException('Chatroom already exists', 400);
    }

    // Create chatroom
    const room = await this.databaseservice.chatRoom.create({
      data: {
        type: createChatroomDto.type,
        owner: {
          connect: { userId: userOwner },
        },
      },
    });

    // Create chatroom owner
    await this.databaseservice.chatRoomMember.create({
      data: {
        member: {
          connect: { userId: userOwner },
        },
        ChatRoom: {
          connect: { id: room.id },
        },
        isAdmin: true,
      },
    });

    // Create chatroom member for second user in case of dm chatroom
    if (createChatroomDto.type === ChatRoomType.Dm) {
      await this.databaseservice.chatRoomMember.create({
        data: {
          member: {
            connect: { userId: createChatroomDto.secondUser },
          },
          ChatRoom: {
            connect: { id: room.id },
          },
          isAdmin: true,
        },
      });
    }

    // Return details of created chatroom
    return new RoomDetailsDto(room);
  }

  async getChatrooms(userId: string) {
    // Get all chatrooms of the user
    const chatrooms = await this.databaseservice.chatRoom.findMany({
      where: {
        members: {
          some: {
            id: userId,
          },
        },
      },
    });

    // Return details of all chatrooms
    return chatrooms.map((room) => new RoomDetailsDto(room));
  }
}
