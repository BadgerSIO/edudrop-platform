import { Schema, model } from "mongoose";
import { ICategory, CategoryModel } from "./category.interface";

const CategorySchema = new Schema<ICategory>(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);
CategorySchema.index({ slug: 1 }, { background: true });
export const Category = model<ICategory, CategoryModel>(
  "Category",
  CategorySchema
);
