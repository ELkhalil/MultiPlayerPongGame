"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const users_service_1 = require("../users/users.service");
const database_service_1 = require("../database/database.service");
const jwt_1 = require("@nestjs/jwt");
const process_1 = require("process");
let AuthService = class AuthService {
    constructor(userservice, dataservice, jwt) {
        this.userservice = userservice;
        this.dataservice = dataservice;
        this.jwt = jwt;
    }
    async getTokens(email, userId) {
        const [access_token, refresh_token] = await Promise.all([
            this.jwt.signAsync({ email, sub: userId }, {
                secret: process_1.env.JWT_SECRET,
                expiresIn: '2h',
            }),
            this.jwt.signAsync({ email, sub: userId }, {
                secret: process_1.env.JWT_RT_SECRET,
                expiresIn: '7d',
            }),
        ]);
        return { access_token, refresh_token };
    }
    async updateHash(userId, rt) {
        const hash = await bcrypt.hash(rt, 10);
        await this.dataservice.user.update({
            where: {
                userId,
            },
            data: {
                refreshToken: hash,
            },
        });
    }
    async login(dto) {
        const user = await this.userservice.getUserByEmail(dto.email);
        if (!user) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        const isMatch = await bcrypt.compare(dto.password, user.password);
        console.log(user.password, ' ', dto.password, ' ', isMatch);
        if (!isMatch) {
            throw new common_1.HttpException('Invalid credentials', common_1.HttpStatus.BAD_REQUEST);
        }
        const tokens = await this.getTokens(user.email, user.userId);
        await this.updateHash(user.userId, tokens.refresh_token);
        return tokens;
    }
    async signup(dto) {
        const hashPassword = await bcrypt.hash(dto.password, 10);
        const newUser = await this.userservice.createUser({
            email: dto.email,
            password: hashPassword,
            username: dto.username,
            avatar: dto.avatar,
            bio: dto.bio,
            firstName: dto.firstName,
            lastName: dto.lastName,
        });
        const tokens = await this.getTokens(newUser.email, newUser.userId);
        await this.updateHash(newUser.userId, tokens.refresh_token);
        return tokens;
    }
    async logout(userId) {
        await this.userservice.updateUser(userId, { refreshToken: null });
    }
    async refresh(refresh_token, userId) {
        const user = await this.userservice.getUserById(userId);
        if (!user)
            throw new common_1.ForbiddenException('User not found');
        if (!user.refreshToken)
            throw new common_1.ForbiddenException('Invalid refresh token oo');
        const is_match = await bcrypt.compare(refresh_token, user.refreshToken);
        if (!is_match)
            throw new common_1.ForbiddenException('Invalid refresh token');
        const tokens = await this.getTokens(user.email, user.userId);
        await this.updateHash(user.userId, tokens.refresh_token);
        return tokens;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        database_service_1.DatabaseService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map