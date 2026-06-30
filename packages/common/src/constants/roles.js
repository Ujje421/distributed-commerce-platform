"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_HIERARCHY = exports.Role = void 0;
exports.hasRolePermission = hasRolePermission;
/**
 * Application roles for RBAC.
 */
var Role;
(function (Role) {
    Role["CUSTOMER"] = "CUSTOMER";
    Role["SELLER"] = "SELLER";
    Role["ADMIN"] = "ADMIN";
    Role["SUPER_ADMIN"] = "SUPER_ADMIN";
})(Role || (exports.Role = Role = {}));
/**
 * Role hierarchy — higher roles inherit permissions of lower roles.
 */
exports.ROLE_HIERARCHY = {
    [Role.SUPER_ADMIN]: [Role.SUPER_ADMIN, Role.ADMIN, Role.SELLER, Role.CUSTOMER],
    [Role.ADMIN]: [Role.ADMIN, Role.SELLER, Role.CUSTOMER],
    [Role.SELLER]: [Role.SELLER, Role.CUSTOMER],
    [Role.CUSTOMER]: [Role.CUSTOMER],
};
/**
 * Check if a role has the required permission level.
 */
function hasRolePermission(userRole, requiredRole) {
    return exports.ROLE_HIERARCHY[userRole]?.includes(requiredRole) ?? false;
}
//# sourceMappingURL=roles.js.map