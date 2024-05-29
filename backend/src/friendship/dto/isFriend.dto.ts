import { IsNotEmpty, IsString } from "class-validator";

export class isFriendDto {
  @IsString()
  @IsNotEmpty()
  friendId: string;
}