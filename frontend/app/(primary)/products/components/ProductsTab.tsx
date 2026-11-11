import React from "react";
import { ICategory, IProduct } from "@/app/types/Product";
import { SERVERURLAPI } from "@/lib/constants";
import { safeFetchJson } from "@/app/utility/safeFetchJson";
import ProductsCatalogClient from "./ProductsCatalogClient";

export async function getAllProductsOptimized(
  filters: Record<string, any> = {},
  sortBy?: string,
  sortOrder?: string,
  page?: number,
  limit?: number
) {
  let url = `${SERVERURLAPI}/product/get-all?sortBy=${
    sortBy ? sortBy : "createdAt"
  }&sortOrder=${sortOrder ? sortOrder : "asc"}&page=${page ? page : 1}&limit=${
    limit ? limit : ""
  }`;

  for (const key in filters) {
    if (Object.prototype.hasOwnProperty.call(filters, key)) {
      url += `&${key}=${filters[key]}`;
    }
  }

  return safeFetchJson(
    url,
    {
      next: { tags: ["productsCollection"] },
      cache: "no-store",
    },
    { data: [] }
  );
}

export const ProductsTab = async () => {
  const productsData = await getAllProductsOptimized();
  const products: IProduct[] = productsData?.data || [];

  // Extract unique categories
  const categoryMap = new Map<string, ICategory>();
  products.forEach((product: IProduct) => {
    const { category } = product;
    if (
      category &&
      typeof category !== "string" &&
      category?._id &&
      !categoryMap.has(category._id)
    ) {
      categoryMap.set(category._id, category);
    }
  });

  const categoriesWithProducts = Array.from(categoryMap.values());

  return (
    <section className="bg-surface-canvas py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <ProductsCatalogClient
          products={products}
          categories={categoriesWithProducts}
        />
      </div>
    </section>
  );
};

export default ProductsTab;
