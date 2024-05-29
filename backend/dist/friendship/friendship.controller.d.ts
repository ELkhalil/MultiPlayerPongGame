import { FriendshipService } from './friendship.service';
import { add_friendDto } from './dto/add-friendship.dto';
import { isFriendDto } from './dto/isFriend.dto';
export declare class FriendshipController {
    private readonly friendshipService;
    constructor(friendshipService: FriendshipService);
    addFriend(add_friendDto: add_friendDto, userId: string): Promise<import("./dto/res-friends.dto").res_friendship>;
    acceptReq(acceptReqDto: add_friendDto, userId: string): Promise<void>;
    rejectReq(rejectReqDto: add_friendDto, userId: string): Promise<void>;
    blockingList(userId: string): Promise<void>;
    isFriend(quer: isFriendDto, userId: string): Promise<boolean>;
    friendList(userId: string): Promise<import("./dto/profile.dto").profile[]>;
    pendingList(userId: string): Promise<import("./dto/profile.dto").profile[]>;
    sentList(userId: string): Promise<import("./dto/profile.dto").profile[]>;
    blockUser(friendId: add_friendDto, userId: string): Promise<{
        send: string;
    }>;
    unblockUser(friendId: add_friendDto, userId: string): Promise<{
        send: string;
    }>;
}
