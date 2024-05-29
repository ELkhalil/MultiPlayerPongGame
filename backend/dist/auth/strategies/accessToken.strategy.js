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
var AtStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtStrategy = void 0;
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const common_1 = require("@nestjs/common");
const users_service_1 = require("../../users/users.service");
const process_1 = require("process");
let AtStrategy = AtStrategy_1 = class AtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    constructor(userService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromExtractors([
                AtStrategy_1.cookieExtractor,
                passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            secretOrKey: process_1.env.JWT_SECRET,
            ignoreExpiration: false,
        });
        this.userService = userService;
    }
    static cookieExtractor(req) {
        if (req.cookies && req.cookies['access_token'])
            return req.cookies['access_token'];
        return null;
    }
    async validate(payload) {
        console.log(payload);
        const curruser = await this.userService.getUserById(payload.sub);
        return { ...curruser, email: payload.email, userId: payload.sub };
    }
};
exports.AtStrategy = AtStrategy;
__decorate([
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AtStrategy, "cookieExtractor", null);
exports.AtStrategy = AtStrategy = AtStrategy_1 = __decorate([
    __param(0, (0, common_1.Inject)(users_service_1.UsersService)),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], AtStrategy);
//# sourceMappingURL=accessToken.strategy.js.map