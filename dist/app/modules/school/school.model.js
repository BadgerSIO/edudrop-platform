"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.School = void 0;
const mongoose_1 = require("mongoose");
const SchoolSchema = new mongoose_1.Schema({
    slug: { type: String, required: true },
    name: { type: String, required: true },
    bursar: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Bursar",
    },
    address: {
        required: true,
        type: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String },
        },
    },
    contactNo: { type: String },
    amountReceived: { type: Number, default: 0 },
    active: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ["active", "pending", "suspended", "archived"],
        default: "pending",
    },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
});
SchoolSchema.index({ slug: 1 }, { background: true });
SchoolSchema.index({ isDeleted: 1, status: 1 });
SchoolSchema.index({ "address.city": 1 });
SchoolSchema.index({ bursar: 1 });
exports.School = (0, mongoose_1.model)("School", SchoolSchema);
