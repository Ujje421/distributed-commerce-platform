"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxMessageStatus = void 0;
var OutboxMessageStatus;
(function (OutboxMessageStatus) {
    OutboxMessageStatus["PENDING"] = "PENDING";
    OutboxMessageStatus["PROCESSING"] = "PROCESSING";
    OutboxMessageStatus["COMPLETED"] = "COMPLETED";
    OutboxMessageStatus["FAILED"] = "FAILED";
    OutboxMessageStatus["DEAD_LETTER"] = "DEAD_LETTER";
})(OutboxMessageStatus || (exports.OutboxMessageStatus = OutboxMessageStatus = {}));
//# sourceMappingURL=outbox-message.interface.js.map