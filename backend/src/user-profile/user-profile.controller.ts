import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import {UserProfileDto } from './dto/UserProfile.dto';
import { AtGuard } from 'src/auth/Guards/access.guard';
import { GetCurrentUser } from 'src/auth/decorators/getCurrentUser.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @UseGuards(AtGuard)
  @Get('me')
  async getMyProfile(
    @GetCurrentUser('userId') userId: string,
  ): Promise<UserProfileDto> {
    return await this.userProfileService.getMyProfile(userId);
  }

  // @Post('avatar')
  // @UseInterceptors(FileInterceptor('image'))
  // @UseGuards(AtGuard)
  // uploadAvatar(
  //   @GetCurrentUser('userId') userId: string,
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       validators: [
  //         new MaxFileSizeValidator({ maxSize: 5e6 }),
  //         new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
  //       ],
  //     }),
  //   )
  //   file: Express.Multer.File,
  // ) {
  //   return this.userProfileService.uploadAvatar(userId, file);
  // }
}
