import { Model, Types } from "mongoose";
import { ICategory } from "../category/category.interface";

export type IProduct = {
  active: boolean; // keep for backward compatibility
  status?: "active" | "draft" | "archived";
  isDeleted?: boolean;
  sku?: string;
  stockQuantity?: number;
  title: string;
  slug: string;
  description: string;
  category: Types.ObjectId | ICategory;
  price: number;
  productImage: string;
  sale?: boolean;
  salePrice?: number;
  packagingType: "Single" | "Case";
  quantityPerCase?: number;
  refillPrice?: number;
  benefits: string[];
  productDetails: string[];
};

export type ProductModel = Model<IProduct, Record<string, unknown>>;
export type IProductFilters = {
  searchTerms?: string;
  name?: string;
  category?: string;
};
// Define a new interface extending the IProduct interface
export interface IProductWithQuantity extends IProduct {
  quantity: number; // Or whatever type 'quantity' is
}
