import { Model } from "mongoose";

export type ICategory = {
  _id?: string;
  title: string;
  description: string;
  slug: string;
  productCount?: number;
};
export type CategoryModel = Model<ICategory, Record<string, unknown>>;
export type ICategoryFilters = {
  searchTerms?: string;
  title?: string;
};
