import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { usersSearchDto } from './dto/search-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    GetSearchedUsers(query: usersSearchDto, userId: string): Promise<{
        username: string;
        email: string;
        avatar: string;
    }[]>;
    whoami(userId: string): Promise<{
        userId: string;
        email: string;
        username: string;
        intraId: string;
        online: boolean;
        firstName: string;
        bio: string;
        lastName: string;
        password: string;
        refreshToken: string;
        avatar: string;
        createdAt: Date;
        updatedAt: Date;
        userLevel: number;
    }>;
    update(req: any, updateUserDto: UpdateUserDto): Promise<{
        message: string;
    }>;
    updatePassword(req: any, updateUserDto: UpdateUserDto): Promise<{
        message: string;
    }>;
}
