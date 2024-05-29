import { ExecutionContext } from '@nestjs/common';
declare const FTauthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class FTauthGuard extends FTauthGuard_base {
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export {};
