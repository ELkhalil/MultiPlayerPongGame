import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { add_friendDto } from './dto/add-friendship.dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import { DatabaseService } from 'src/database/database.service';
import { $Enums } from '@prisma/client';
import { res_friendship } from './dto/res-friends.dto';
import { profile } from './dto/profile.dto';

@Injectable()
export class FriendshipService {
  constructor(private databaseservice: DatabaseService) {}
  async addFriend(add_friendDto: add_friendDto, userId: string) {
    console.log(add_friendDto.friendId, ' ', userId);
    if (add_friendDto.friendId === userId) {
      throw new HttpException(
        'userd id is the same as firend id',
        HttpStatus.FORBIDDEN,
      );
    }
    const friendshipId = `${userId}+${add_friendDto.friendId}`;
    const friends = await this.databaseservice.friendship.upsert({
      where: {
        id: friendshipId,
      },
      create: {
        id: friendshipId,
        from: {
          connect: {
            userId,
          },
        },
        to: {
          connect: {
            userId: add_friendDto.friendId,
          },
        },
        status: $Enums.FriendshipStatus.PENDING,
      },
      update: {},
    });
    const responseOfReq = new res_friendship(friends);
    return responseOfReq;
  }

  async blockedUsers(userId: string) {
    const blocked = await this.databaseservice.blockedUser.findMany({
      where: {
        blockedBy: userId,
      },
      select: {
        blockedId: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    return blocked.map((friend) => new profile(friend.blockedId));
  }

  async acceptReq(userId: string, friendId: string) {
    if (userId === friendId) {
      throw new HttpException(
        'userd id is the same as firend id',
        HttpStatus.FORBIDDEN,
      );
    }
    const request = await this.databaseservice.friendship.findMany({
      where: {
        OR: [{ id: `${userId}+${friendId}` }, { id: `${friendId}+${userId}` }],
      },
    });
    if (!request) {
      throw new HttpException('', HttpStatus.NOT_FOUND);
    }
    const result = await this.databaseservice.friendship.updateMany({
      where: {
        OR: [{ id: `${userId}+${friendId}` }, { id: `${friendId}+${userId}` }],
      },
      data: {
        status: $Enums.FriendshipStatus.ACCEPTED,
      },
    });
    return new res_friendship(result);
  }

  async isFriend(userId: string, friendId: string) {
    if (userId === friendId) {
      throw new HttpException(
        'userd id is the same as firend id',
        HttpStatus.FORBIDDEN,
      );
    }
    const request1 = await this.databaseservice.friendship.findFirst({
      where: {
        OR: [{ id: `${userId}+${friendId}` }, { id: `${friendId}+${userId}` }],
        status: $Enums.FriendshipStatus.ACCEPTED,
      },
    });

    return !!request1;
  }

  async rejectFriend(userId: string, friendId: string) {
    if (userId === friendId) {
      throw new HttpException(
        'userd id is the same as firend id',
        HttpStatus.FORBIDDEN,
      );
    }
    await this.databaseservice.friendship.deleteMany({
      where: {
        OR: [{ id: `${userId}+${friendId}` }, { id: `${friendId}+${userId}` }],
      },
    });

    return { send: 'done' };
  }

  async friendList(userId: string) {
    const friends = await this.databaseservice.friendship.findMany({
      where: {
        OR: [
          {
            fromUser: userId,
            status: $Enums.FriendshipStatus.ACCEPTED,
          },
          {
            toUser: userId,
            status: $Enums.FriendshipStatus.ACCEPTED,
          },
        ],
      },
      select: {
        from: {
          select: {
            userId: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        to: {
          select: {
            userId: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    return friends.map((friend) => {
      if (friend.from.userId === userId) {
        return new profile(friend.to);
      }
      return new profile(friend.from);
    });
  }

  async pendingList(userId: string) {
    const friends = await this.databaseservice.friendship.findMany({
      where: {
        toUser: userId,
        status: $Enums.FriendshipStatus.PENDING,
      },
      select: {
        from: {
          select: {
            userId: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    return friends.map((friend) => new profile(friend.from));
  }

  async sentList(userId: string) {
    const friends = await this.databaseservice.friendship.findMany({
      where: {
        fromUser: userId,
        status: $Enums.FriendshipStatus.PENDING,
      },
      select: {
        to: {
          select: {
            userId: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    return friends.map((friend) => new profile(friend.to));
  }

  async blockUser(userId: string, friendId: string) {
    console.log(userId, ' block ', friendId);

    if (userId === friendId) {
      throw new HttpException(
        'User id is the same as friend id',
        HttpStatus.FORBIDDEN,
      );
    }

    // Check if the block already exists
  const existingBlock = await this.databaseservice.blockedUser.findFirst({
    where: {
      OR: [
        {
          blockedBy: userId,
          blocked: friendId,
        },
        {
          blockedBy: friendId,
          blocked: userId,
        },
      ],
    },
  });

  if (existingBlock) {
    if (existingBlock.blockedBy === userId) {
      // You have blocked this user
      throw new HttpException(
        'This user is already blocked',
        HttpStatus.BAD_REQUEST,
      );
    } else {
      // This user has blocked you
      throw new HttpException(
        'This user has already blocked you',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

    // Delete any existing friendship between the users
    await this.databaseservice.friendship.deleteMany({
      where: {
        OR: [{ id: `${userId}+${friendId}` }, { id: `${friendId}+${userId}` }],
      },
    });
    const commonRoom = await this.databaseservice.chatRoom.findFirst({
      where: {
        type: $Enums.ChatRoomType.Dm,
        members: {
          every: {
            id: {
              in: [userId, friendId],
            },
          },
        },
      },
    });
    // Create a new block
    await this.databaseservice.blockedUser.create({
      data: {
        blocked: friendId,
        blockedBy: userId,
        dmId: commonRoom?.id,

      },
    });

    return { send: 'done' };
  }

  async unblockUser(userId: string, friendId: string) {
    console.log(userId, ' unblock ', friendId);
    if (userId === friendId) {
      throw new HttpException(
        'userd id is the same as firend id',
        HttpStatus.FORBIDDEN,
      );
    }
    await this.databaseservice.blockedUser.deleteMany({
      where: {
        AND: [{ blockedBy: userId }, { blocked: friendId }],
      },
    });
    return { send: 'done' };
  }
}
