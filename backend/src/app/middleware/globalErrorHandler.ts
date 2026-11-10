import { ErrorRequestHandler } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { IGenericErrorMessages } from "../../interfaces/error";
import handleValidationError from "../../error/handleValidationError";
import handleCastError from "../../error/handleCastError";
import handleZodError from "../../error/handleZodError";
import ApiError from "../../error/ApiError";
import config from "../../config";

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = "Something went wrong";
  let errorMessage: IGenericErrorMessages[] = [];

  if (error instanceof multer.MulterError) {
    statusCode = 400;
    if (error.code === "LIMIT_FILE_SIZE") {
      message = "Image file size exceeds the 5MB upload limit.";
    } else if (error.code === "LIMIT_FILE_COUNT") {
      message = "Too many image files uploaded in a single request.";
    } else {
      message = error.message || "Invalid file upload request.";
    }
    errorMessage = [{ path: error.field || "", message }];
  } else if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessage = simplifiedError.errorMessage;
  } else if (error.name === "ValidationError") {
    const simplifiedError = handleValidationError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessage = simplifiedError.errorMessages;
  } else if (error?.name === "CastError") {
    const simplifiedError = handleCastError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessage = simplifiedError.errorMessage;
  } else if (error.code === 11000) {
    statusCode = 400;
    message = "Duplicate key error";
    const keys = Object.keys(error.keyPattern || {});
    errorMessage = [
      {
        path: keys.join(", "),
        message: `${keys.join(", ")} already exists`,
      },
    ];
  } else if (error instanceof ApiError) {
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
  } else if (error instanceof Error) {
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
    stack: config.env !== "production" ? error?.stack : undefined,
  });
};

export default globalErrorHandler;
