/**
 * Application roles for RBAC.
 */
export enum Role {
  CUSTOMER = 'CUSTOMER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

/**
 * Role hierarchy — higher roles inherit permissions of lower roles.
 */
export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  [Role.SUPER_ADMIN]: [Role.SUPER_ADMIN, Role.ADMIN, Role.SELLER, Role.CUSTOMER],
  [Role.ADMIN]: [Role.ADMIN, Role.SELLER, Role.CUSTOMER],
  [Role.SELLER]: [Role.SELLER, Role.CUSTOMER],
  [Role.CUSTOMER]: [Role.CUSTOMER],
};

/**
 * Check if a role has the required permission level.
 */
export function hasRolePermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole]?.includes(requiredRole) ?? false;
}
