import { Logger } from '@nestjs/common';

/**
 * Method decorator providing a fallback execution path if the original method fails.
 */
export function Fallback(fallbackMethodName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const logger = new Logger('FallbackDecorator');

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        logger.warn(
          `Method ${propertyKey} failed. Executing fallback method ${fallbackMethodName}. Error: ${(error as Error).message}`
        );
        
        if (typeof this[fallbackMethodName] !== 'function') {
          logger.error(`Fallback method ${fallbackMethodName} not found on class`);
          throw error;
        }

        return this[fallbackMethodName].apply(this, [...args, error]);
      }
    };

    return descriptor;
  };
}
