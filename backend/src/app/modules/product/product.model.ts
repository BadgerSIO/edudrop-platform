import { Schema, model } from "mongoose";
import { IProduct, ProductModel } from "./product.interface";

const ProductSchema = new Schema<IProduct>(
  {
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
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
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
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);
ProductSchema.index({ slug: 1 }, { background: true });
ProductSchema.index({ isDeleted: 1, status: 1 });
ProductSchema.index({ category: 1 });
export const Product = model<IProduct, ProductModel>("Product", ProductSchema);
