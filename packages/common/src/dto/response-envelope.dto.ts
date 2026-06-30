import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseEnvelope<T> {
  @ApiProperty()
  success: boolean;

  @ApiPropertyOptional()
  data?: T;

  @ApiPropertyOptional()
  message?: string;

  @ApiProperty()
  timestamp: string;

  @ApiPropertyOptional()
  correlationId?: string;

  constructor(partial: Partial<ResponseEnvelope<T>>) {
    this.success = partial.success ?? true;
    this.data = partial.data;
    this.message = partial.message;
    this.timestamp = new Date().toISOString();
    this.correlationId = partial.correlationId;
  }

  static ok<T>(data: T, correlationId?: string): ResponseEnvelope<T> {
    return new ResponseEnvelope<T>({
      success: true,
      data,
      correlationId,
    });
  }

  static created<T>(data: T, correlationId?: string): ResponseEnvelope<T> {
    return new ResponseEnvelope<T>({
      success: true,
      data,
      message: 'Resource created successfully',
      correlationId,
    });
  }

  static error(message: string, correlationId?: string): ResponseEnvelope<null> {
    return new ResponseEnvelope<null>({
      success: false,
      data: null,
      message,
      correlationId,
    });
  }
}
