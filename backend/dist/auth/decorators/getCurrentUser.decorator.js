"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCurrentUser = void 0;
const common_1 = require("@nestjs/common");
exports.GetCurrentUser = (0, common_1.createParamDecorator)((data, cntx) => {
    const request = cntx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user && user[data] : user;
});
//# sourceMappingURL=getCurrentUser.decorator.js.map