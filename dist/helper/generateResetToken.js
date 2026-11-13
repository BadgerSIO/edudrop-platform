"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const generateResetToken = () => {
    const prefix = "EDUDROP-"; // Custom prefix for the reset token
    let resetToken = `${prefix}${crypto_1.default.randomUUID()}`.substring(0, 25); // Generate initial ID
    // Remove trailing dashes or underscores, if any
    while (resetToken.endsWith("-") || resetToken.endsWith("_")) {
        resetToken = resetToken.slice(0, -1);
    }
    return resetToken;
};
exports.default = generateResetToken;
