import { add_friendDto } from './dto/add-friendship.dto';
import { DatabaseService } from 'src/database/database.service';
import { res_friendship } from './dto/res-friends.dto';
import { profile } from './dto/profile.dto';
export declare class FriendshipService {
    private databaseservice;
    constructor(databaseservice: DatabaseService);
    addFriend(add_friendDto: add_friendDto, userId: string): Promise<res_friendship>;
    blockedUsers(userId: string): Promise<profile[]>;
    acceptReq(userId: string, friendId: string): Promise<res_friendship>;
    isFriend(userId: string, friendId: string): Promise<boolean>;
    rejectFriend(userId: string, friendId: string): Promise<{
        send: string;
    }>;
    friendList(userId: string): Promise<profile[]>;
    pendingList(userId: string): Promise<profile[]>;
    sentList(userId: string): Promise<profile[]>;
    blockUser(userId: string, friendId: string): Promise<{
        send: string;
    }>;
    unblockUser(userId: string, friendId: string): Promise<{
        send: string;
    }>;
}
