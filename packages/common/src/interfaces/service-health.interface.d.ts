/**
 * Service health check interface for liveness and readiness probes.
 */
export interface IServiceHealth {
    service: string;
    status: HealthStatus;
    version: string;
    uptime: number;
    timestamp: string;
    checks: IHealthCheck[];
}
export interface IHealthCheck {
    name: string;
    status: HealthStatus;
    responseTime?: number;
    details?: Record<string, unknown>;
}
export declare enum HealthStatus {
    UP = "UP",
    DOWN = "DOWN",
    DEGRADED = "DEGRADED"
}
//# sourceMappingURL=service-health.interface.d.ts.map