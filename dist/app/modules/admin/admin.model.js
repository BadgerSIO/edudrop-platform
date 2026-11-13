"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = exports.AdminSchema = void 0;
const mongoose_1 = require("mongoose");
exports.AdminSchema = new mongoose_1.Schema({
    email: { type: String, required: true },
    name: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
    },
    contactNo: { type: String, required: true },
    presentAddress: { type: String },
    permanentAddress: { type: String },
    deviceCount: { type: Number },
    ipAddress: { type: [String] },
    profileImage: { type: String },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
});
exports.Admin = (0, mongoose_1.model)("Admin", exports.AdminSchema);
