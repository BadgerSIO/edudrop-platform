export type IProduct = {
  _id: string;
  active: boolean;
  status?: "active" | "draft" | "archived";
  isDeleted?: boolean;
  sku?: string;
  stockQuantity?: number;
  title: string;
  slug: string;
  description: string;
  category: string | ICategory;
  price: number;
  productImage: string;
  sale?: boolean;
  salePrice?: number;
  packagingType: "Single" | "Case";
  quantityPerCase?: number;
  refillPrice?: number;
  benefits: string[];
  productDetails: string[];
  createdAt?: string;
  updatedAt?: string;
};
export type ICategory = {
  _id: string;
  title: string;
  description: string;
  slug: string;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
};
// Define a new interface extending the IProduct interface
export interface IProductWithQuantity extends IProduct {
  quantity: number; // Or whatever type 'quantity' is
}
export function isICategory(category: any): category is ICategory {
  return (category as ICategory)?.title !== undefined;
}
