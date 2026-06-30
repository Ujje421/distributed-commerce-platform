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
exports.ResponseEnvelope = void 0;
const swagger_1 = require("@nestjs/swagger");
class ResponseEnvelope {
    success;
    data;
    message;
    timestamp;
    correlationId;
    constructor(partial) {
        this.success = partial.success ?? true;
        this.data = partial.data;
        this.message = partial.message;
        this.timestamp = new Date().toISOString();
        this.correlationId = partial.correlationId;
    }
    static ok(data, correlationId) {
        return new ResponseEnvelope({
            success: true,
            data,
            correlationId,
        });
    }
    static created(data, correlationId) {
        return new ResponseEnvelope({
            success: true,
            data,
            message: 'Resource created successfully',
            correlationId,
        });
    }
    static error(message, correlationId) {
        return new ResponseEnvelope({
            success: false,
            data: null,
            message,
            correlationId,
        });
    }
}
exports.ResponseEnvelope = ResponseEnvelope;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ResponseEnvelope.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], ResponseEnvelope.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], ResponseEnvelope.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ResponseEnvelope.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], ResponseEnvelope.prototype, "correlationId", void 0);
//# sourceMappingURL=response-envelope.dto.js.map