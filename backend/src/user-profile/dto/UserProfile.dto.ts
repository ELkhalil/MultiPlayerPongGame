import { ChatRoom, ChatRoomMember, Friendship, User } from "@prisma/client";

type ProfileDtoProps = Partial<User> &
  Partial<{
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

export class UserProfileDto {
  constructor(userData: ProfileDtoProps, is_friend: boolean) {
    this.id = userData.userId;
    this.name = {
      first: userData.firstName,
      last: userData.lastName,
    };
    this.bio = userData.bio;
    this.email = userData.email;
    this.picture = userData.avatar;
    this.username = userData.username;
    if (is_friend) {
      this.friendship = [...userData.left_friends, ...userData.right_friends];
    }
    this.wonGamesNumber = userData.wonGamesNumber;
  }

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
