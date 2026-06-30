"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationErrorDto = exports.ErrorResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ErrorResponseDto {
    statusCode;
    message;
    error;
    details;
    timestamp;
    path;
    correlationId;
    constructor(partial) {
        this.statusCode = partial.statusCode ?? 500;
        this.message = partial.message ?? 'Internal Server Error';
        this.error = partial.error;
        this.details = partial.details;
        this.timestamp = new Date().toISOString();
        this.path = partial.path;
        this.correlationId = partial.correlationId;
    }
}
exports.ErrorResponseDto = ErrorResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ErrorResponseDto.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ErrorResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], ErrorResponseDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], ErrorResponseDto.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ErrorResponseDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], ErrorResponseDto.prototype, "path", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], ErrorResponseDto.prototype, "correlationId", void 0);
class ValidationErrorDto extends ErrorResponseDto {
    validationErrors;
    constructor(errors, correlationId) {
        super({
            statusCode: 400,
            message: 'Validation failed',
            error: 'Bad Request',
            correlationId,
        });
        this.validationErrors = errors;
    }
}
exports.ValidationErrorDto = ValidationErrorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], ValidationErrorDto.prototype, "validationErrors", void 0);
//# sourceMappingURL=error-response.dto.js.map