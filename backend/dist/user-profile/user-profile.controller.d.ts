import { UserProfileService } from './user-profile.service';
import { UserProfileDto } from './dto/UserProfile.dto';
export declare class UserProfileController {
    private readonly userProfileService;
    constructor(userProfileService: UserProfileService);
    getMyProfile(userId: string): Promise<UserProfileDto>;
}
