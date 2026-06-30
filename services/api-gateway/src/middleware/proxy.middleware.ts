import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { SERVICE_PORTS, ServiceName } from '@ecommerce/common';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ProxyMiddleware.name);

  // Map route prefixes to downstream services
  private readonly routingMap: Record<string, string> = {
    '/api/v1/auth': `http://localhost:${SERVICE_PORTS[ServiceName.IDENTITY_SERVICE]}`,
    '/api/v1/users': `http://localhost:${SERVICE_PORTS[ServiceName.USER_SERVICE]}`,
    '/api/v1/products': `http://localhost:${SERVICE_PORTS[ServiceName.PRODUCT_CATALOG_SERVICE]}`,
    '/api/v1/categories': `http://localhost:${SERVICE_PORTS[ServiceName.PRODUCT_CATALOG_SERVICE]}`,
    '/api/v1/inventory': `http://localhost:${SERVICE_PORTS[ServiceName.INVENTORY_SERVICE]}`,
    '/api/v1/cart': `http://localhost:${SERVICE_PORTS[ServiceName.CART_SERVICE]}`,
    '/api/v1/orders': `http://localhost:${SERVICE_PORTS[ServiceName.ORDER_SERVICE]}`,
    '/api/v1/payments': `http://localhost:${SERVICE_PORTS[ServiceName.PAYMENT_SERVICE]}`,
    '/api/v1/shipments': `http://localhost:${SERVICE_PORTS[ServiceName.SHIPPING_SERVICE]}`,
    '/api/v1/reviews': `http://localhost:${SERVICE_PORTS[ServiceName.REVIEW_SERVICE]}`,
    '/api/v1/recommendations': `http://localhost:${SERVICE_PORTS[ServiceName.RECOMMENDATION_SERVICE]}`,
  };

  use(req: Request, res: Response, next: NextFunction) {
    const path = req.baseUrl || req.path;
    
    // Find matching route prefix
    const prefix = Object.keys(this.routingMap).find(p => path.startsWith(p));

    if (!prefix) {
      this.logger.warn(`No downstream service configured for path: ${path}`);
      return next();
    }

    const targetUrl = this.routingMap[prefix];
    
    // Use http-proxy-middleware to forward the request
    const proxy = createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      onProxyReq: (proxyReq, req: any) => {
        // Forward Correlation ID
        const correlationId = req.headers['x-correlation-id'];
        if (correlationId) {
          proxyReq.setHeader('x-correlation-id', correlationId);
        }
      },
      onError: (err, req, res: any) => {
        this.logger.error(`Proxy Error: ${err.message}`, err.stack);
        res.status(502).json({
          success: false,
          message: 'Bad Gateway - Downstream service is unreachable',
          error: err.message,
          timestamp: new Date().toISOString(),
          correlationId: req.headers['x-correlation-id'],
        });
      },
    });

    return proxy(req, res, next);
  }
}
