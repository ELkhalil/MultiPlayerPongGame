import { Strategy } from 'passport-jwt';
import { JwtPayload } from '../types';
import { UsersService } from 'src/users/users.service';
declare const AtStrategy_base: new (...args: any[]) => Strategy;
export declare class AtStrategy extends AtStrategy_base {
    private userService;
    constructor(userService: UsersService);
    private static cookieExtractor;
    validate(payload: any): Promise<JwtPayload>;
}
export {};
