/**
 * Authenticated user interface representing the JWT payload
 * attached to requests by the auth middleware.
 */
export interface IAuthenticatedUser {
    userId: string;
    email: string;
    roles: string[];
    sessionId: string;
    iat?: number;
    exp?: number;
}
//# sourceMappingURL=authenticated-user.interface.d.ts.map