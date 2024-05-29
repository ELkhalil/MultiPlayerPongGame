import { AuthDto } from './dto/auth.dto';
import { UsersService } from 'src/users/users.service';
import { DatabaseService } from 'src/database/database.service';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
export declare class AuthService {
    private userservice;
    private dataservice;
    private jwt;
    constructor(userservice: UsersService, dataservice: DatabaseService, jwt: JwtService);
    getTokens(email: string, userId: string): Promise<Tokens>;
    updateHash(userId: string, rt: string): Promise<void>;
    login(dto: AuthDto): Promise<Tokens>;
    signup(dto: CreateUserDto): Promise<Tokens>;
    logout(userId: string): Promise<void>;
    refresh(refresh_token: string, userId: string): Promise<Tokens>;
}
