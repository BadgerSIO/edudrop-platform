"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateOrderID = () => {
    const prefix = "ORDER-"; // Custom prefix for the order ID
    let customOrderID = `${prefix}${crypto.randomUUID()}`.substring(0, 15); // Generate initial ID
    // Remove trailing dashes or underscores, if any
    while (customOrderID.endsWith("-") || customOrderID.endsWith("_")) {
        customOrderID = customOrderID.slice(0, -1);
    }
    return customOrderID;
};
exports.default = generateOrderID;
