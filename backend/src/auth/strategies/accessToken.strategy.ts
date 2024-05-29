import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Inject, Req } from '@nestjs/common';
import { JwtPayload } from '../types';
import { UsersService } from 'src/users/users.service';
import { env } from 'process';

export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject(UsersService) private userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        AtStrategy.cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  private static cookieExtractor(@Req() req: Request) {
    if (req.cookies && req.cookies['access_token'])
      return req.cookies['access_token'];
    return null;
  }

  async validate(payload: any): Promise<JwtPayload> {
    console.log(payload);
    const curruser = await this.userService.getUserById(payload.sub);
    return { ...curruser, email: payload.email , userId: payload.sub};
  }
}
