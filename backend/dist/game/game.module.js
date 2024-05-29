"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModule = void 0;
const common_1 = require("@nestjs/common");
const game_gateway_1 = require("./game.gateway");
const game_service_1 = require("./game.service");
const matchmaking_service_1 = require("./matchmaking.service");
const database_module_1 = require("../database/database.module");
const jwt_1 = require("@nestjs/jwt");
const client_service_1 = require("./client.service");
const connection_service_1 = require("./connection.service");
let GameModule = class GameModule {
};
exports.GameModule = GameModule;
exports.GameModule = GameModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            jwt_1.JwtModule.register({ secret: process.env.JWT_SECRET }),
        ],
        providers: [
            game_gateway_1.GameGateway,
            game_service_1.GameService,
            matchmaking_service_1.MatchmakingService,
            client_service_1.ClientService,
            connection_service_1.ConnectionService,
        ],
    })
], GameModule);
//# sourceMappingURL=game.module.js.map