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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const users_service_1 = require("../users/users.service");
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
const swagger_1 = require("@nestjs/swagger");
const getCurrentUser_decorator_1 = require("./decorators/getCurrentUser.decorator");
const refresh_guard_1 = require("./Guards/refresh.guard");
const create_user_dto_1 = require("../users/dto/create-user.dto");
let AuthController = class AuthController {
    constructor(authService, UsersService) {
        this.authService = authService;
        this.UsersService = UsersService;
    }
    fortyTwoAuth() {
    }
    fortyTwoCallback(res) { }
    async login(res, dto) {
        const tokens = await this.authService.login(dto);
        res.cookie('access_token', tokens.access_token, { httpOnly: true });
        res.cookie('refresh_token', tokens.refresh_token, {
            httpOnly: true,
            path: '/auth',
        });
    }
    async isUsernameUnique(req, res) {
        const result = await this.UsersService.getUserByUsername(req.username);
        if (result) {
            res.status(common_1.HttpStatus.OK).send({ message: 'Username already exists' });
        }
        else {
            res.status(common_1.HttpStatus.OK).send({ message: 'Username is unique' });
        }
    }
    async isEmailUnique(req, res) {
        const result = await this.UsersService.getUserByEmail(req.email);
        if (result) {
            res.status(common_1.HttpStatus.OK).send({ message: 'Email already exists' });
        }
        else {
            res.status(common_1.HttpStatus.OK).send({ message: 'Email is unique' });
        }
    }
    async signup(res, dto) {
        const tokens = await this.authService.signup(dto);
        res.cookie('access_token', tokens.access_token, { httpOnly: true });
        res.cookie('refresh_token', tokens.refresh_token, {
            httpOnly: true,
            path: '/auth',
        });
        return tokens;
    }
    async refresh(res, refreshToken, userId) {
        const tokens = await this.authService.refresh(refreshToken, userId);
        res.cookie('access_token', tokens.access_token, { httpOnly: true });
        res.cookie('refresh_token', tokens.refresh_token, {
            httpOnly: true,
            path: '/auth',
        });
        return { message: 'ok' };
    }
    async logout(userId, res) {
        await this.authService.logout(userId);
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        res.redirect('http://localhost:3000');
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('42'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('42')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "fortyTwoAuth", null);
__decorate([
    (0, common_1.Get)('42/callback'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('42')),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "fortyTwoCallback", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.AuthDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('checkusername'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "isUsernameUnique", null);
__decorate([
    (0, common_1.Post)('checkemail'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "isEmailUnique", null);
__decorate([
    (0, common_1.Post)('signup'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Get)('refresh'),
    (0, swagger_1.ApiCookieAuth)('refresh_token'),
    (0, common_1.UseGuards)(refresh_guard_1.RtGuard),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, getCurrentUser_decorator_1.GetCurrentUser)('refreshToken')),
    __param(2, (0, getCurrentUser_decorator_1.GetCurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Get)('logout'),
    (0, swagger_1.ApiCookieAuth)('refresh_token'),
    (0, common_1.UseGuards)(refresh_guard_1.RtGuard),
    __param(0, (0, getCurrentUser_decorator_1.GetCurrentUser)('userId')),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        users_service_1.UsersService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map