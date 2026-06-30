/**
 * Application roles for RBAC.
 */
export declare enum Role {
    CUSTOMER = "CUSTOMER",
    SELLER = "SELLER",
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN"
}
/**
 * Role hierarchy — higher roles inherit permissions of lower roles.
 */
export declare const ROLE_HIERARCHY: Record<Role, Role[]>;
/**
 * Check if a role has the required permission level.
 */
export declare function hasRolePermission(userRole: Role, requiredRole: Role): boolean;
//# sourceMappingURL=roles.d.ts.map