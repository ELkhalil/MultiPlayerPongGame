import { usersSearchDto } from './../users/dto/search-user.dto';
import { UsersService } from './../users/users.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserProfileDto } from './dto/UserProfile.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserProfileService {
  constructor(
    private databaseservice: DatabaseService,
    private UsersService: UsersService,
  ) {}
  async getMyProfile(userId: string) {
    const currentuser = await this.UsersService.getUserById(userId);
    if (!currentuser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // const wonGamesNumber = await this.databaseservice.game.count({
    //   where: {
    //     winnerId: userId,
    //   },
    // });
    const wonGamesNumber = 0;

    return new UserProfileDto({ ...currentuser, wonGamesNumber }, false);
  }
  // async uploadAvatar(userId: string, file: Express.Multer.File);
}
