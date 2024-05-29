import { UsersService } from './../users/users.service';
import { UserProfileDto } from './dto/UserProfile.dto';
import { DatabaseService } from 'src/database/database.service';
export declare class UserProfileService {
    private databaseservice;
    private UsersService;
    constructor(databaseservice: DatabaseService, UsersService: UsersService);
    getMyProfile(userId: string): Promise<UserProfileDto>;
}
