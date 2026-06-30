import { Role } from '../constants/roles';
export declare const ROLES_KEY = "roles";
/**
 * Decorator to set required roles for a route handler.
 * Usage: @Roles(Role.ADMIN, Role.SELLER)
 */
export declare const Roles: (...roles: Role[]) => import("@nestjs/common").CustomDecorator<string>;
//# sourceMappingURL=roles.decorator.d.ts.map