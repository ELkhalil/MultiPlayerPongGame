import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JwtPayloadWithRt } from '../types/jwtPayloadRT.type';

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayloadWithRt | undefined, cntx: ExecutionContext) => {
    const request = cntx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user && user[data] : user;
  },
);
