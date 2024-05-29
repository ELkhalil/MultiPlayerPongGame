import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { add_friendDto } from './dto/add-friendship.dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import { AtGuard } from 'src/auth/Guards/access.guard';
import { GetCurrentUser } from 'src/auth/decorators/getCurrentUser.decorator';
import { isFriendDto } from './dto/isFriend.dto';

@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @UseGuards(AtGuard)
  @Post('add')
  async addFriend(
    @Body() add_friendDto: add_friendDto,
    @GetCurrentUser('userId') userId: string,
  ) {
    return this.friendshipService.addFriend(add_friendDto, userId);
  }

  @UseGuards(AtGuard)
  @Post('accept')
  async acceptReq(
    @Body() acceptReqDto: add_friendDto,
    @GetCurrentUser('userId') userId: string,
  ) {
    this.friendshipService.acceptReq(userId, acceptReqDto.friendId);
  }

  @UseGuards(AtGuard)
  @Post('reject')
  async rejectReq(
    @Body() rejectReqDto: add_friendDto,
    @GetCurrentUser('userId') userId: string,
  ) {
    console.log("hahahaha",rejectReqDto.friendId);
    this.friendshipService.rejectFriend(userId, rejectReqDto.friendId);
  }

  @UseGuards(AtGuard)
  @Post('blockingList')
  async blockingList(@GetCurrentUser('userId') userId: string) {
    this.friendshipService.blockedUsers(userId);
  }

  @UseGuards(AtGuard)
  @Get('isFriend')
  async isFriend(
    @Query() quer: isFriendDto,
    @GetCurrentUser('userId') userId: string,
  ) {
    console.log(quer.friendId, ' ', userId);
    return this.friendshipService.isFriend(userId, quer.friendId);
  }

  @UseGuards(AtGuard)
  @Get('friendList')
  async friendList(@GetCurrentUser('userId') userId: string) {
    return this.friendshipService.friendList(userId);
  }

  @UseGuards(AtGuard)
  @Get('pendingList')
  async pendingList(@GetCurrentUser('userId') userId: string) {
    return this.friendshipService.pendingList(userId);
  }

  @UseGuards(AtGuard)
  @Get('sentList')
  async sentList(@GetCurrentUser('userId') userId: string) {
    return this.friendshipService.sentList(userId);
  }

  @UseGuards(AtGuard)
  @Post('block')
  async blockUser(
    @Body() friendId: add_friendDto,
    @GetCurrentUser('userId') userId: string,
  ) {
    return this.friendshipService.blockUser(userId, friendId.friendId);
  }

  @UseGuards(AtGuard)
  @Post('unblock/')
  async unblockUser(
    @Body() friendId: add_friendDto,
    @GetCurrentUser('userId') userId: string,
  ) {
    return this.friendshipService.unblockUser(userId, friendId.friendId);
  }
}
