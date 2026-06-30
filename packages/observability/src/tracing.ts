import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Logger } from '@nestjs/common';

const logger = new Logger('OpenTelemetry');

export function initTracing(serviceName: string): NodeSDK | undefined {
  if (process.env.NODE_ENV === 'test') {
    return undefined; // Don't start tracing in tests
  }

  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

  const traceExporter = new OTLPTraceExporter({
    url: `${otlpEndpoint}/v1/traces`,
  });

  const metricExporter = new OTLPMetricExporter({
    url: `${otlpEndpoint}/v1/metrics`,
  });

  const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 10000,
  });

  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
      deployment_environment: process.env.NODE_ENV || 'development',
    }),
    traceExporter,
    metricReader,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false }, // Too noisy
        '@opentelemetry/instrumentation-net': { enabled: false },
      }),
    ],
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => logger.log('OpenTelemetry SDK shut down successfully'))
      .catch((error) => logger.error('Error shutting down OpenTelemetry SDK', error))
      .finally(() => process.exit(0));
  });

  try {
    sdk.start();
    logger.log(`OpenTelemetry initialized for service: ${serviceName}`);
    return sdk;
  } catch (error) {
    logger.error('Failed to initialize OpenTelemetry', error);
    return undefined;
  }
}
