import React from "react";
import CategoryManager from "./components/CategoryManager";
import { SERVERURLAPI } from "@/lib/constants";
import { safeFetchJson } from "@/app/utility/safeFetchJson";

export const metadata = {
  title: "Manage Categories | Admin Dashboard",
  description: "Organize and configure product categories for classroom supplies.",
};

export async function getCategories() {
  return safeFetchJson(
    `${SERVERURLAPI}/categories`,
    {
      next: { tags: ["categoryCollections"] },
      cache: "no-store",
    },
    { data: [] }
  );
}

const ManageCategories = async () => {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <CategoryManager initialCategories={categories?.data || []} />
    </div>
  );
};

export default ManageCategories;
