import { z } from "zod";

const createProductZodSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: "Title is required",
    }).min(2, "Title must be at least 2 characters"),
    slug: z.string().optional(),
    description: z.string({
      required_error: "Description is required",
    }).min(5, "Description must be at least 5 characters"),
    category: z.string({
      required_error: "Category is required",
    }),
    price: z.coerce.number({
      required_error: "Price is required",
    }).min(0, "Price cannot be negative"),
    productImage: z.string().optional(),
    sale: z.boolean().optional(),
    salePrice: z.coerce.number().min(0, "Sale price cannot be negative").optional(),
    packagingType: z.enum(["Single", "Case"], {
      required_error: "Packaging type must be 'Single' or 'Case'",
    }),
    quantityPerCase: z.coerce.number().min(1, "Quantity per case must be at least 1").optional(),
    refillPrice: z.coerce.number().min(0, "Refill price cannot be negative").optional(),
    benefits: z.array(z.string()).optional(),
    productDetails: z.array(z.string()).optional(),
    status: z.enum(["active", "draft", "archived"]).optional(),
    sku: z.string().optional(),
    stockQuantity: z.coerce.number().min(0).optional(),
  }),
});

const updateProductZodSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    slug: z.string().optional(),
    description: z.string().min(5).optional(),
    category: z.string().optional(),
    price: z.coerce.number().min(0).optional(),
    productImage: z.string().optional(),
    sale: z.boolean().optional(),
    salePrice: z.coerce.number().min(0).optional(),
    packagingType: z.enum(["Single", "Case"]).optional(),
    quantityPerCase: z.coerce.number().min(1).optional(),
    refillPrice: z.coerce.number().min(0).optional(),
    benefits: z.array(z.string()).optional(),
    productDetails: z.array(z.string()).optional(),
    status: z.enum(["active", "draft", "archived"]).optional(),
    sku: z.string().optional(),
    stockQuantity: z.coerce.number().min(0).optional(),
    active: z.boolean().optional(),
  }),
});

export const ProductValidation = {
  createProductZodSchema,
  updateProductZodSchema,
};
