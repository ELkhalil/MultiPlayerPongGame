"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileDto = void 0;
class UserProfileDto {
    constructor(userData, is_friend) {
        this.id = userData.userId;
        this.name = {
            first: userData.firstName,
            last: userData.lastName,
        };
        this.bio = userData.bio;
        this.email = userData.email;
        this.picture = userData.avatar;
        this.username = userData.username;
        if (is_friend) {
            this.friendship = [...userData.left_friends, ...userData.right_friends];
        }
        this.wonGamesNumber = userData.wonGamesNumber;
    }
}
exports.UserProfileDto = UserProfileDto;
//# sourceMappingURL=UserProfile.dto.js.map