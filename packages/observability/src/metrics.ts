import { Registry, collectDefaultMetrics, Histogram, Counter } from 'prom-client';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry: Registry;
  
  public readonly httpRequestDurationMicroseconds: Histogram<string>;
  public readonly activeRequests: Counter<string>;
  public readonly customMetrics: Record<string, any> = {};

  constructor() {
    this.registry = new Registry();
    
    // Add default Node.js metrics (CPU, memory, event loop, etc.)
    collectDefaultMetrics({ register: this.registry });

    // Define standard HTTP metrics
    this.httpRequestDurationMicroseconds = new Histogram({
      name: 'http_request_duration_ms',
      help: 'Duration of HTTP requests in ms',
      labelNames: ['method', 'route', 'code'],
      buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
      registers: [this.registry],
    });

    this.activeRequests = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'code'],
      registers: [this.registry],
    });
  }

  onModuleInit() {
    // Initialization logic if needed
  }

  /**
   * Return all metrics formatted for Prometheus scraping
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Register a custom domain metric
   */
  registerMetric(name: string, metric: any): void {
    this.customMetrics[name] = metric;
    this.registry.registerMetric(metric);
  }
}
