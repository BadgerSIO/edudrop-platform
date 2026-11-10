import React from "react";
import ProductCard from "@/app/sharedComponents/ProductCard";
import SectionHeader from "@/app/sharedComponents/ui/SectionHeader";
import { IProduct } from "@/app/types/Product";
import { getAllProductsOptimized } from "../../components/ProductsTab";

export const RelatedProduct = async ({ product }: { product: IProduct }) => {
  const categoryId =
    typeof product?.category === "string" ? undefined : product?.category?._id;

  const products = await getAllProductsOptimized(
    { category: categoryId },
    undefined,
    undefined,
    undefined,
    4
  );

  const filterProduct = products?.data?.filter(
    (item: IProduct) => item?.slug !== product?.slug
  );

  if (!filterProduct || filterProduct.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border-subtle bg-surface-bento/60 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8">
        <SectionHeader
          eyebrow="Care Package Essentials"
          title="Frequently Sponsored Together"
          subtitle="Combine pure spring water cases with classroom dispensers and cups for maximum campus wellness."
        />

        <div className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filterProduct.slice(0, 3).map((item: IProduct) => (
            <ProductCard product={item} key={item?._id || item?.slug} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProduct;
