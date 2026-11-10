import React from "react";
import ProductForm from "../../components/ProductForm";
import { getCategories } from "../../manage-categories/page";
import { SERVERURLAPI } from "@/lib/constants";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Product | Admin Dashboard",
  description: "Update product parameters, inventory, and fulfillment details.",
};

async function getSingleProductBySlug(slug: string) {
  try {
    const res = await fetch(`${SERVERURLAPI}/product/${slug}`, {
      next: { tags: ["productSingle"] },
      cache: "no-store",
    });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (error) {
    return null;
  }
}

const SingleProductDash = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const data = await getSingleProductBySlug(slug);

  if (!data?.data) {
    notFound();
  }

  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <ProductForm
        categories={categories?.data || []}
        initialData={data.data}
        isEdit={true}
        rTag="productSingle"
      />
    </div>
  );
};

export default SingleProductDash;
