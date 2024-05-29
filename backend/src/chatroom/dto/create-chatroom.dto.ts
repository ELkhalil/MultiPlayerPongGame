import { ChatRoomType } from '@prisma/client';
import {
  IsNotEmpty,
  IsString,
  Length,
  ValidateIf,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class CreateChatroomDto {
  @ValidateIf((o) => o.type !== 'Dm')
  @IsString()
  @IsNotEmpty()
  @Length(5, 10)
  roomName: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(ChatRoomType)
  type: ChatRoomType;

  @IsString()
  @IsNotEmpty()
  @Length(5, 10)
  @IsOptional()
  password: string;

  @ValidateIf((o) => o.type === 'Dm')
  @IsString()
  @IsNotEmpty()
  secondUser: string;
}
