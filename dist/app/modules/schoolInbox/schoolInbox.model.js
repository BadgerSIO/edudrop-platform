"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolInbox = void 0;
const mongoose_1 = require("mongoose");
const SchoolInboxSchema = new mongoose_1.Schema({
    bursar: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Bursar",
        required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String, required: true },
    messageId: { type: String },
    seen: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ["unread", "read", "replied", "archived"],
        default: "unread",
    },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
});
// High performance multitenancy and inbox status indexes
SchoolInboxSchema.index({ bursar: 1, seen: 1, isDeleted: 1 });
SchoolInboxSchema.index({ bursar: 1, status: 1 });
SchoolInboxSchema.index({ bursar: 1, createdAt: -1 });
exports.SchoolInbox = (0, mongoose_1.model)("SchoolInbox", SchoolInboxSchema);
