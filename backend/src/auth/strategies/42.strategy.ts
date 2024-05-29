import { CloudinaryService } from './../../imagesProvider/cloudinary.service';
import { Injectable, Scope } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-42';
import Profile from 'passport-42';
import { UsersService } from 'src/users/users.service';
import { AuthService } from '../auth.service';
import { Response } from 'express';
import VerifiedCallback from 'passport-42';
import { env } from 'process';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(
    private readonly User: UsersService,
    private readonly AuthService: AuthService,
    private readonly CloudinaryService: CloudinaryService
  ) {
    super({
      clientID: env.FT_CLIENT_ID,
      clientSecret: env.FT_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/42/callback',
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    cb: Function,
  ): Promise<any> {
    const res: Response = req.res;
    const UserExust = await this.User.getUserByIntraId(
      profile['_json']['id'].toString(),
    );
    console.log(profile['_json']['first_name']);
    if (UserExust) {
      const tokens = await this.AuthService.getTokens(
        UserExust.email,
        UserExust.userId,
      );
      await this.AuthService.updateHash(UserExust.userId, tokens.refresh_token);
      res.cookie('access_token', tokens.access_token, {
        httpOnly: true,
      });
      res.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        path: '/auth',
      });
      res.redirect('http://localhost:3000');
      return cb(null, profile);
    }
    const newUser = await this.User.createUser({
      username: profile['_json']['login'],
      firstName: profile['_json']['first_name'],
      lastName: profile['_json']['last_name'],
      intraId: profile['_json']['id'].toString(),
      email: profile['_json']['email'],
      // avatar: profile['_json']['image']['link'],
    });
    const resCloud = this.CloudinaryService.upload(
      newUser.userId,
      profile['_json']['image']['link'],
    );
    const tokens = await this.AuthService.getTokens(
      newUser.email,
      newUser.userId,
    );
    await this.AuthService.updateHash(newUser.userId, tokens.refresh_token);
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
    });
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      path: '/auth',
    });
    res.redirect('http://localhost:3000');
    console.log(newUser);
    return cb(null, profile);
  }
}
