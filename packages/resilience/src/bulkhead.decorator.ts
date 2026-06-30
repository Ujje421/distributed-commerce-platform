import { Logger } from '@nestjs/common';

export class BulkheadRejectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BulkheadRejectionError';
  }
}

/**
 * Method decorator that limits concurrent executions (Bulkhead pattern).
 * Prevents resource exhaustion in one part of the system from cascading.
 */
export function Bulkhead(maxConcurrent: number, maxQueueSize: number = 0) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const logger = new Logger('BulkheadDecorator');
    
    let currentConcurrent = 0;
    let currentQueue = 0;
    const queue: Array<() => void> = [];

    descriptor.value = async function (...args: any[]) {
      // Fast path: under limits
      if (currentConcurrent < maxConcurrent) {
        currentConcurrent++;
        try {
          return await originalMethod.apply(this, args);
        } finally {
          currentConcurrent--;
          processNext();
        }
      }

      // Queue path
      if (currentQueue < maxQueueSize) {
        currentQueue++;
        logger.debug(`Method ${propertyKey} queued. Queue size: ${currentQueue}/${maxQueueSize}`);
        
        return new Promise((resolve, reject) => {
          queue.push(async () => {
            currentQueue--;
            currentConcurrent++;
            try {
              const result = await originalMethod.apply(this, args);
              resolve(result);
            } catch (err) {
              reject(err);
            } finally {
              currentConcurrent--;
              processNext();
            }
          });
        });
      }

      // Rejection path
      throw new BulkheadRejectionError(
        `Bulkhead limit reached for ${propertyKey}. Max concurrent: ${maxConcurrent}, Max queue: ${maxQueueSize}`
      );
    };

    function processNext() {
      if (queue.length > 0 && currentConcurrent < maxConcurrent) {
        const next = queue.shift();
        if (next) {
          next();
        }
      }
    }

    return descriptor;
  };
}
