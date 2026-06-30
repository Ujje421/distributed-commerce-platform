export declare class ErrorResponseDto {
    statusCode: number;
    message: string;
    error?: string;
    details?: Record<string, unknown>;
    timestamp: string;
    path?: string;
    correlationId?: string;
    constructor(partial: Partial<ErrorResponseDto>);
}
export declare class ValidationErrorDto extends ErrorResponseDto {
    validationErrors: string[];
    constructor(errors: string[], correlationId?: string);
}
//# sourceMappingURL=error-response.dto.d.ts.map