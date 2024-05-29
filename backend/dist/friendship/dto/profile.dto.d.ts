import { User } from '@prisma/client';
export declare class profile {
    constructor(friend: Partial<User>);
    uername: string;
    firstName: string;
    lastName: string;
    avatar: string;
}
