import { Logger } from '@nestjs/common';

export interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  backoffFactor: number;
  jitter: boolean;
  retryableErrors?: Array<new (...args: any[]) => Error>;
}

/**
 * Sleep helper
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Method decorator for automatic retries with exponential backoff and optional jitter.
 */
export function Retry(options: Partial<RetryOptions> = {}) {
  const maxAttempts = options.maxAttempts ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 1000;
  const backoffFactor = options.backoffFactor ?? 2;
  const jitter = options.jitter ?? true;
  const retryableErrors = options.retryableErrors;

  return function (
    _target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const logger = new Logger('RetryDecorator');

    descriptor.value = async function (...args: any[]) {
      let attempt = 1;

      while (true) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          // Check if error is retryable (if list is provided)
          const isRetryable =
            !retryableErrors ||
            retryableErrors.some((errType) => error instanceof errType);

          if (!isRetryable || attempt >= maxAttempts) {
            throw error;
          }

          // Calculate delay with exponential backoff
          let delay = initialDelayMs * Math.pow(backoffFactor, attempt - 1);
          
          // Add jitter (±20%) to prevent thundering herd problem
          if (jitter) {
            const jitterAmount = delay * 0.2;
            delay = delay - jitterAmount + Math.random() * (jitterAmount * 2);
          }

          logger.warn(
            `Method ${propertyKey} failed (Attempt ${attempt}/${maxAttempts}). Retrying in ${Math.round(delay)}ms... Error: ${(error as Error).message}`
          );

          await sleep(delay);
          attempt++;
        }
      }
    };

    return descriptor;
  };
}
