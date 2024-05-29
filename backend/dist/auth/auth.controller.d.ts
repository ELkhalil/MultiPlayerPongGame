import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Tokens } from './types';
import { Response } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
export declare class AuthController {
    private authService;
    private UsersService;
    constructor(authService: AuthService, UsersService: UsersService);
    fortyTwoAuth(): void;
    fortyTwoCallback(res: any): void;
    login(res: Response, dto: AuthDto): Promise<void>;
    isUsernameUnique(req: any, res: Response): Promise<void>;
    isEmailUnique(req: any, res: any): Promise<void>;
    signup(res: Response, dto: CreateUserDto): Promise<Tokens>;
    refresh(res: Response, refreshToken: string, userId: string): Promise<{
        message: string;
    }>;
    logout(userId: string, res: Response): Promise<void>;
}
