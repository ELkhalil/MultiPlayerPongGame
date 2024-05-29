"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FortyTwoStrategy = void 0;
const cloudinary_service_1 = require("./../../imagesProvider/cloudinary.service");
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_42_1 = __importDefault(require("passport-42"));
const users_service_1 = require("../../users/users.service");
const auth_service_1 = require("../auth.service");
const process_1 = require("process");
let FortyTwoStrategy = class FortyTwoStrategy extends (0, passport_1.PassportStrategy)(passport_42_1.default, '42') {
    constructor(User, AuthService, CloudinaryService) {
        super({
            clientID: process_1.env.FT_CLIENT_ID,
            clientSecret: process_1.env.FT_CLIENT_SECRET,
            callbackURL: 'http://localhost:3000/auth/42/callback',
            passReqToCallback: true,
        });
        this.User = User;
        this.AuthService = AuthService;
        this.CloudinaryService = CloudinaryService;
    }
    async validate(req, accessToken, refreshToken, profile, cb) {
        const res = req.res;
        const UserExust = await this.User.getUserByIntraId(profile['_json']['id'].toString());
        console.log(profile['_json']['first_name']);
        if (UserExust) {
            const tokens = await this.AuthService.getTokens(UserExust.email, UserExust.userId);
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
        });
        const resCloud = this.CloudinaryService.upload(newUser.userId, profile['_json']['image']['link']);
        const tokens = await this.AuthService.getTokens(newUser.email, newUser.userId);
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
};
exports.FortyTwoStrategy = FortyTwoStrategy;
exports.FortyTwoStrategy = FortyTwoStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        auth_service_1.AuthService,
        cloudinary_service_1.CloudinaryService])
], FortyTwoStrategy);
//# sourceMappingURL=42.strategy.js.map