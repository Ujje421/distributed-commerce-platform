import * as winston from 'winston';
import LokiTransport from 'winston-loki';

/**
 * Creates a configured Winston logger instance that outputs JSON logs
 * and optionally forwards logs to Grafana Loki.
 */
export function createLogger(serviceName: string) {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ];

  // In a real environment, conditionally add Loki transport
  if (process.env.LOKI_URL) {
    transports.push(
      new LokiTransport({
        host: process.env.LOKI_URL,
        labels: { app: serviceName, env: process.env.NODE_ENV || 'development' },
        json: true,
        format: winston.format.json(),
        replaceTimestamp: true,
        onConnectionError: (err) => console.error('Loki connection error:', err)
      }) as any
    );
  }

  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: { service: serviceName },
    transports,
  });
}
