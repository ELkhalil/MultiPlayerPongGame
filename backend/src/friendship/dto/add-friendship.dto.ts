import { IsNotEmpty, IsString } from 'class-validator';

export class add_friendDto {
  @IsString()
  @IsNotEmpty()
  friendId: string;
}
