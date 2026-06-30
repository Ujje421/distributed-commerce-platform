/**
 * Saga step interface for orchestration-based saga pattern.
 * Each step defines a forward action and a compensation action.
 */
export interface ISagaStep<TInput = unknown, TOutput = unknown> {
  /** Unique name of this saga step */
  name: string;

  /** Execute the forward action */
  execute(input: TInput): Promise<TOutput>;

  /** Execute the compensation (rollback) action */
  compensate(input: TInput): Promise<void>;
}

/**
 * Saga execution context tracking the state of a saga instance.
 */
export interface ISagaContext {
  sagaId: string;
  sagaType: string;
  correlationId: string;
  currentStep: number;
  totalSteps: number;
  status: SagaStatus;
  startedAt: string;
  completedAt: string | null;
  steps: ISagaStepResult[];
  compensatingFrom: number | null;
}

export interface ISagaStepResult {
  stepName: string;
  status: SagaStepStatus;
  startedAt: string;
  completedAt: string | null;
  output: unknown;
  error: string | null;
}

export enum SagaStatus {
  STARTED = 'STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  COMPENSATING = 'COMPENSATING',
  COMPENSATED = 'COMPENSATED',
  FAILED = 'FAILED',
}

export enum SagaStepStatus {
  PENDING = 'PENDING',
  EXECUTING = 'EXECUTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATING = 'COMPENSATING',
  COMPENSATED = 'COMPENSATED',
}
