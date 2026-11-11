"use client";
import React, { useMemo, useRef, useState } from "react";
import { ICategory, IProduct, isICategory } from "@/app/types/Product";
import ProductCard from "@/app/sharedComponents/ProductCard";
import ProductSearchFilter from "./ProductSearchFilter";
import RoleCheckoutGuard from "@/app/sharedComponents/RoleCheckoutGuard";
import { runViewTransition, toViewTransitionName } from "@/app/utility/viewTransition";
import { SearchX } from "lucide-react";

interface ProductsCatalogClientProps {
  products: IProduct[];
  categories: ICategory[];
}

export const ProductsCatalogClient: React.FC<ProductsCatalogClientProps> = ({
  products,
  categories,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelectCategory = (category: string) => {
    runViewTransition(() => {
      setSelectedCategory(category);
    });
  };

  const handleResetFromEmpty = () => {
    runViewTransition(
      () => {
        setSearchQuery("");
        setSelectedCategory("all");
      },
      () => {
        containerRef.current?.focus();
      }
    );
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categorySlug = isICategory(product.category)
        ? product.category.slug
        : "";

      const matchesCategory =
        selectedCategory === "all" || categorySlug === selectedCategory;

      const matchesSearch =
        searchQuery === "" ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (isICategory(product.category) &&
          product.category.title.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div ref={containerRef} tabIndex={-1} className="w-full focus:outline-none">
      <RoleCheckoutGuard variant="banner" redirectTo="/products" className="mb-6" />

      {/* Unified Bento Search & Category Filter Toolbar */}
      <ProductSearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        categories={categories}
        totalCount={products.length}
        filteredCount={filteredProducts.length}
      />

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product, idx) => (
            <ProductCard
              key={product._id || product.slug}
              product={product}
              style={{
                viewTransitionName: toViewTransitionName(
                  "product-card",
                  product._id || product.slug || String(idx)
                ),
              }}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border border-border-subtle bg-white p-12 text-center shadow-bento">
          <SearchX className="mx-auto h-12 w-12 text-text-body/60" />
          <h3 className="mt-4 text-xl font-bold text-text-ink">
            No classroom supplies match your search
          </h3>
          <p className="mt-2 text-sm text-text-body">
            Try adjusting your search terms or selecting another category to
            view available essentials.
          </p>
          <button
            type="button"
            onClick={handleResetFromEmpty}
            className="mt-6 inline-flex rounded-full bg-surface-forest px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-surface-forest-light"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsCatalogClient;
