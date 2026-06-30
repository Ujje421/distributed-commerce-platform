export declare class ResponseEnvelope<T> {
    success: boolean;
    data?: T;
    message?: string;
    timestamp: string;
    correlationId?: string;
    constructor(partial: Partial<ResponseEnvelope<T>>);
    static ok<T>(data: T, correlationId?: string): ResponseEnvelope<T>;
    static created<T>(data: T, correlationId?: string): ResponseEnvelope<T>;
    static error(message: string, correlationId?: string): ResponseEnvelope<null>;
}
//# sourceMappingURL=response-envelope.dto.d.ts.map