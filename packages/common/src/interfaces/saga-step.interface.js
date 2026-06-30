"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SagaStepStatus = exports.SagaStatus = void 0;
var SagaStatus;
(function (SagaStatus) {
    SagaStatus["STARTED"] = "STARTED";
    SagaStatus["IN_PROGRESS"] = "IN_PROGRESS";
    SagaStatus["COMPLETED"] = "COMPLETED";
    SagaStatus["COMPENSATING"] = "COMPENSATING";
    SagaStatus["COMPENSATED"] = "COMPENSATED";
    SagaStatus["FAILED"] = "FAILED";
})(SagaStatus || (exports.SagaStatus = SagaStatus = {}));
var SagaStepStatus;
(function (SagaStepStatus) {
    SagaStepStatus["PENDING"] = "PENDING";
    SagaStepStatus["EXECUTING"] = "EXECUTING";
    SagaStepStatus["COMPLETED"] = "COMPLETED";
    SagaStepStatus["FAILED"] = "FAILED";
    SagaStepStatus["COMPENSATING"] = "COMPENSATING";
    SagaStepStatus["COMPENSATED"] = "COMPENSATED";
})(SagaStepStatus || (exports.SagaStepStatus = SagaStepStatus = {}));
//# sourceMappingURL=saga-step.interface.js.map