import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  // Define public paths that bypass auth checks
  private readonly publicPaths = [
    { path: '/api/v1/auth/register', method: 'POST' },
    { path: '/api/v1/auth/login', method: 'POST' },
    { path: '/api/v1/auth/refresh', method: 'POST' },
    { path: '/api/v1/auth/oauth', method: 'GET' }, // matches Google/GitHub OAuth redirection
    { path: '/api/v1/products', method: 'GET' },
    { path: '/api/v1/categories', method: 'GET' },
    { path: '/api/v1/recommendations/trending', method: 'GET' },
  ];

  use(req: Request, res: Response, next: NextFunction) {
    const requestPath = req.baseUrl || req.path;
    const requestMethod = req.method;

    // Check if the route is public
    const isPublic = this.publicPaths.some((route) => {
      // Check if it's exact match or starts with path (e.g. /api/v1/auth/oauth/google)
      const matchesPath = route.path === requestPath || requestPath.startsWith(route.path);
      const matchesMethod = route.method === requestMethod;
      return matchesPath && matchesMethod;
    });

    if (isPublic) {
      return next();
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Missing or invalid token format',
        timestamp: new Date().toISOString(),
      });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'secret_key_2024';

    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      // Inject decoded user into the request object
      (req as any).user = {
        id: decoded.sub,
        email: decoded.email,
        roles: decoded.roles,
      };
      
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid or expired token',
        timestamp: new Date().toISOString(),
        error: (err as Error).message,
      });
    }
  }
}
