"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
/**
 * Parameter decorator that extracts the authenticated user from the request.
 * Usage: @CurrentUser() user: IAuthenticatedUser
 * Usage: @CurrentUser('userId') userId: string
 */
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
        return null;
    }
    return data ? user[data] : user;
});
//# sourceMappingURL=current-user.decorator.js.map