"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponse = (res, data) => {
    res.status(data.statusCode).json({
        success: data.success,
        message: data.message,
        meta: data.meta || null || undefined,
        data: data.data || null,
        additionalData: data.additionalData || undefined,
    });
};
exports.default = sendResponse;
