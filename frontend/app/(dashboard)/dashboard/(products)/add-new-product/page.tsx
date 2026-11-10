import React from "react";
import ProductForm from "../components/ProductForm";
import { getCategories } from "../manage-categories/page";

export const metadata = {
  title: "Add New Product | Admin Dashboard",
  description: "Create and publish a new product to the EduDrop catalog.",
};

const AddNewProduct = async () => {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <ProductForm categories={categories?.data || []} />
    </div>
  );
};

export default AddNewProduct;
