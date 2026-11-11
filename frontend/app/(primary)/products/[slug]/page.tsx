import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Hero from "./components/Hero";
import ProductInfo from "./components/ProductInfo";
import { SERVERURLAPI } from "@/lib/constants";
import { safeFetchJson } from "@/app/utility/safeFetchJson";
import { IProduct } from "@/app/types/Product";

async function getProductOptimized(slug: string) {
  return safeFetchJson<{ data?: IProduct } | null>(
    `${SERVERURLAPI}/product/optimized/${slug}`,
    {
      next: { tags: ["productsCollection"] },
      cache: "no-store",
    },
    null
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const data = await getProductOptimized(slug);
    const product = data?.data;
    return {
      title: `${product?.title || "Classroom Essential"} | EduDrop Foundation`,
      description:
        product?.description ||
        `Sponsor ${product?.title || "classroom supplies"} for verified partner classrooms with direct gate delivery.`,
    };
  } catch {
    return {
      title: "Classroom Supply | EduDrop Foundation",
      description: "Sponsor essential hydration and classroom supplies.",
    };
  }
}

const ProductSingle = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const data = await getProductOptimized(slug);
  const product = data?.data;

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-surface-canvas">
      <Hero product={product} />
      <ProductInfo product={product} />
    </main>
  );
};

export default ProductSingle;
