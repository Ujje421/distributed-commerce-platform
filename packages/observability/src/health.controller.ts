import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics';

@Controller('health')
export class HealthController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('liveness')
  checkLiveness() {
    return { status: 'UP', timestamp: new Date().toISOString() };
  }

  @Get('readiness')
  checkReadiness() {
    // Here we would check dependencies like DB, Redis, etc.
    // For now, return a generic OK
    return { status: 'UP', timestamp: new Date().toISOString() };
  }

  @Get('metrics')
  async getMetrics() {
    // Explicitly set content type in the real implementation
    return this.metricsService.getMetrics();
  }
}
