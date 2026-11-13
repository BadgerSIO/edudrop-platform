"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryValidation = void 0;
const zod_1 = require("zod");
const createCategoryZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({
            required_error: "Title is required",
        }).min(2, "Category title must be at least 2 characters"),
        description: zod_1.z.string({
            required_error: "Description is required",
        }).min(5, "Category description must be at least 5 characters"),
        slug: zod_1.z.string().optional(),
    }),
});
const updateCategoryZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(2, "Category title must be at least 2 characters").optional(),
        description: zod_1.z.string().min(5, "Category description must be at least 5 characters").optional(),
        slug: zod_1.z.string().optional(),
    }),
});
exports.CategoryValidation = {
    createCategoryZodSchema,
    updateCategoryZodSchema,
};
