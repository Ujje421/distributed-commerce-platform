// ============================================================
// @ecommerce/common - Shared library for all microservices
// ============================================================

// --- DTOs ---
export * from './dto/pagination.dto';
export * from './dto/response-envelope.dto';
export * from './dto/error-response.dto';

// --- Events ---
export * from './events/event-types';
export * from './events/event-payload.interface';
export * from './events/domain-events';

// --- Decorators ---
export * from './decorators/current-user.decorator';
export * from './decorators/idempotency-key.decorator';
export * from './decorators/roles.decorator';
export * from './decorators/public.decorator';

// --- Guards ---
export * from './guards/jwt-auth.guard';
export * from './guards/roles.guard';
export * from './guards/api-key.guard';

// --- Interceptors ---
export * from './interceptors/transform.interceptor';
export * from './interceptors/logging.interceptor';
export * from './interceptors/timeout.interceptor';

// --- Filters ---
export * from './filters/global-exception.filter';
export * from './filters/http-exception.filter';

// --- Interfaces ---
export * from './interfaces/authenticated-user.interface';
export * from './interfaces/outbox-message.interface';
export * from './interfaces/saga-step.interface';
export * from './interfaces/service-health.interface';

// --- Utils ---
export * from './utils/correlation-id';
export * from './utils/hash';
export * from './utils/idempotency';

// --- Constants ---
export * from './constants/roles';
export * from './constants/services';
export * from './constants/kafka-topics';
