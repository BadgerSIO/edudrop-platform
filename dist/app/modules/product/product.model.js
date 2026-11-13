"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const ProductSchema = new mongoose_1.Schema({
    active: { type: Boolean, default: true },
    status: {
        type: String,
        enum: ["active", "draft", "archived"],
        default: "active",
    },
    isDeleted: { type: Boolean, default: false },
    sku: { type: String },
    stockQuantity: { type: Number, default: 0 },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true },
    productImage: { type: String, required: true },
    sale: { type: Boolean, default: false },
    salePrice: { type: Number },
    packagingType: {
        type: String,
        enum: ["Single", "Case"],
        required: true,
    },
    quantityPerCase: { type: Number },
    refillPrice: { type: Number },
    benefits: [{ type: String }],
    productDetails: [{ type: String }],
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
});
ProductSchema.index({ slug: 1 }, { background: true });
ProductSchema.index({ isDeleted: 1, status: 1 });
ProductSchema.index({ category: 1 });
exports.Product = (0, mongoose_1.model)("Product", ProductSchema);
