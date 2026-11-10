import { z } from "zod";

const createCategoryZodSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: "Title is required",
    }).min(2, "Category title must be at least 2 characters"),
    description: z.string({
      required_error: "Description is required",
    }).min(5, "Category description must be at least 5 characters"),
    slug: z.string().optional(),
  }),
});

const updateCategoryZodSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Category title must be at least 2 characters").optional(),
    description: z.string().min(5, "Category description must be at least 5 characters").optional(),
    slug: z.string().optional(),
  }),
});

export const CategoryValidation = {
  createCategoryZodSchema,
  updateCategoryZodSchema,
};
