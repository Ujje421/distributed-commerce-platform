import { Logger } from '@nestjs/common';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  failureThreshold: number;      // Number of failures before opening
  successThreshold: number;      // Number of successes before closing from half-open
  resetTimeoutMs: number;        // Time to wait in OPEN before moving to HALF_OPEN
  name?: string;                 // Identifier for logging
}

export class CircuitBreakerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

/**
 * A robust Circuit Breaker implementation for inter-service calls.
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private nextAttemptAt = 0;
  private readonly options: Required<CircuitBreakerOptions>;
  private readonly logger = new Logger(CircuitBreaker.name);

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      successThreshold: options.successThreshold ?? 2,
      resetTimeoutMs: options.resetTimeoutMs ?? 30000,
      name: options.name ?? 'default',
    };
  }

  /**
   * Execute an async function protected by the circuit breaker.
   */
  async execute<T>(action: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() > this.nextAttemptAt) {
        this.transitionTo(CircuitState.HALF_OPEN);
      } else {
        throw new CircuitBreakerError(`Circuit '${this.options.name}' is OPEN`);
      }
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.options.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      }
    } else {
      // Reset failure count in CLOSED state on success
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;

    if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in half-open immediately transitions back to open
      this.transitionTo(CircuitState.OPEN);
    } else if (this.failureCount >= this.options.failureThreshold) {
      this.transitionTo(CircuitState.OPEN);
    }
  }

  private transitionTo(newState: CircuitState): void {
    this.logger.warn(`Circuit '${this.options.name}' transitioned from ${this.state} to ${newState}`);
    this.state = newState;

    if (newState === CircuitState.OPEN) {
      this.nextAttemptAt = Date.now() + this.options.resetTimeoutMs;
    } else if (newState === CircuitState.HALF_OPEN) {
      this.successCount = 0;
    } else if (newState === CircuitState.CLOSED) {
      this.failureCount = 0;
      this.successCount = 0;
    }
  }

  public getState(): CircuitState {
    return this.state;
  }
}
