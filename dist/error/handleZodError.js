"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleZodError = (error) => {
    const errors = error.issues.map((issue) => {
        return {
            path: issue.path.length > 0 ? String(issue.path[issue.path.length - 1]) : '',
            message: issue.message,
        };
    });
    const statusCode = 400;
    return {
        statusCode,
        message: 'Validation Error',
        errorMessage: errors,
    };
};
exports.default = handleZodError;
