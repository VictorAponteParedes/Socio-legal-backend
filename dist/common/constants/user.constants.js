"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_STATUS_VALUES = exports.USER_ROLE_VALUES = exports.UserStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["CLIENT"] = "client";
    UserRole["LAWYER"] = "lawyer";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["PENDING"] = "pending";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
exports.USER_ROLE_VALUES = Object.values(UserRole);
exports.USER_STATUS_VALUES = Object.values(UserStatus);
//# sourceMappingURL=user.constants.js.map