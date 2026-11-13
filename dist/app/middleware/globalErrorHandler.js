"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const zod_1 = require("zod");
const handleValidationError_1 = __importDefault(require("../../error/handleValidationError"));
const handleCastError_1 = __importDefault(require("../../error/handleCastError"));
const handleZodError_1 = __importDefault(require("../../error/handleZodError"));
const ApiError_1 = __importDefault(require("../../error/ApiError"));
const config_1 = __importDefault(require("../../config"));
const globalErrorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = "Something went wrong";
    let errorMessage = [];
    if (error instanceof multer_1.default.MulterError) {
        statusCode = 400;
        if (error.code === "LIMIT_FILE_SIZE") {
            message = "Image file size exceeds the 5MB upload limit.";
        }
        else if (error.code === "LIMIT_FILE_COUNT") {
            message = "Too many image files uploaded in a single request.";
        }
        else {
            message = error.message || "Invalid file upload request.";
        }
        errorMessage = [{ path: error.field || "", message }];
    }
    else if (error instanceof zod_1.ZodError) {
        const simplifiedError = (0, handleZodError_1.default)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessage = simplifiedError.errorMessage;
    }
    else if (error.name === "ValidationError") {
        const simplifiedError = (0, handleValidationError_1.default)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessage = simplifiedError.errorMessages;
    }
    else if ((error === null || error === void 0 ? void 0 : error.name) === "CastError") {
        const simplifiedError = (0, handleCastError_1.default)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessage = simplifiedError.errorMessage;
    }
    else if (error.code === 11000) {
        statusCode = 400;
        message = "Duplicate key error";
        const keys = Object.keys(error.keyPattern || {});
        errorMessage = [
            {
                path: keys.join(", "),
                message: `${keys.join(", ")} already exists`,
            },
        ];
    }
    else if (error instanceof ApiError_1.default) {
        statusCode = error.statusCode;
        message = error.message;
        errorMessage = error.message
            ? [
                {
                    path: "",
                    message: error.message,
                },
            ]
            : [];
    }
    else if (error instanceof Error) {
        message = error.message;
        errorMessage = error.message
            ? [
                {
                    path: "",
                    message: error.message,
                },
            ]
            : [];
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorMessage,
        stack: config_1.default.env !== "production" ? error === null || error === void 0 ? void 0 : error.stack : undefined,
    });
};
exports.default = globalErrorHandler;
