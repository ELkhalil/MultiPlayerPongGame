import { ChatRoom, ChatRoomMember, Friendship, User } from "@prisma/client";
type ProfileDtoProps = Partial<User> & Partial<{
    left_friends: Friendship[];
    right_friends: Friendship[];
    roomMember: ChatRoomMember[];
    owned_rooms: ChatRoom[];
    wonGamesNumber: number;
}>;
export type NAME = {
    first: string;
    last: string;
};
export declare class UserProfileDto {
    constructor(userData: ProfileDtoProps, is_friend: boolean);
    id: string;
    profileFinished: boolean;
    name: NAME;
    bio: string;
    phone: string;
    picture: string;
    email: string;
    username: string;
    friendship: Friendship[];
    wonGamesNumber: number;
}
export {};
