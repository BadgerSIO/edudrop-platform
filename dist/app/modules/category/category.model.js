"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const CategorySchema = new mongoose_1.Schema({
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
});
CategorySchema.index({ slug: 1 }, { background: true });
exports.Category = (0, mongoose_1.model)("Category", CategorySchema);
