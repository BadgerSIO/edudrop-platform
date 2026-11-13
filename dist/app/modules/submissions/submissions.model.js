"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Submissions = void 0;
const mongoose_1 = require("mongoose");
const SubmissionsSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    topic: { type: String, trim: true },
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
SubmissionsSchema.index({ seen: 1, isDeleted: 1 });
SubmissionsSchema.index({ status: 1, isDeleted: 1 });
SubmissionsSchema.index({ createdAt: -1 });
exports.Submissions = (0, mongoose_1.model)("Submissions", SubmissionsSchema);
