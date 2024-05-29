/// <reference types="cookie-parser" />
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayloadWithRt } from '../types/jwtPayloadRT.type';
declare const RtStrategy_base: new (...args: any[]) => Strategy;
export declare class RtStrategy extends RtStrategy_base {
    constructor();
    private static cookieExtractor;
    validate(req: Request, payload: any): Promise<JwtPayloadWithRt>;
}
export {};
