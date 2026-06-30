import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional()
  error?: string;

  @ApiPropertyOptional()
  details?: Record<string, unknown>;

  @ApiProperty()
  timestamp: string;

  @ApiPropertyOptional()
  path?: string;

  @ApiPropertyOptional()
  correlationId?: string;

  constructor(partial: Partial<ErrorResponseDto>) {
    this.statusCode = partial.statusCode ?? 500;
    this.message = partial.message ?? 'Internal Server Error';
    this.error = partial.error;
    this.details = partial.details;
    this.timestamp = new Date().toISOString();
    this.path = partial.path;
    this.correlationId = partial.correlationId;
  }
}

export class ValidationErrorDto extends ErrorResponseDto {
  @ApiProperty({ type: [String] })
  validationErrors: string[];

  constructor(errors: string[], correlationId?: string) {
    super({
      statusCode: 400,
      message: 'Validation failed',
      error: 'Bad Request',
      correlationId,
    });
    this.validationErrors = errors;
  }
}
