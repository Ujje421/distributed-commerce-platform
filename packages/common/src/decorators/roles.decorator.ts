import { SetMetadata } from '@nestjs/common';
import { Role } from '../constants/roles';

export const ROLES_KEY = 'roles';

/**
 * Decorator to set required roles for a route handler.
 * Usage: @Roles(Role.ADMIN, Role.SELLER)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
