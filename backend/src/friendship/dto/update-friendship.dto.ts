import { PartialType } from '@nestjs/swagger';
import { add_friendDto } from './add-friendship.dto';

export class UpdateFriendshipDto extends PartialType(add_friendDto) {}
