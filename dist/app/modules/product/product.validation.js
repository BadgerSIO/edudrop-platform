"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductValidation = void 0;
const zod_1 = require("zod");
const createProductZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({
            required_error: "Title is required",
        }).min(2, "Title must be at least 2 characters"),
        slug: zod_1.z.string().optional(),
        description: zod_1.z.string({
            required_error: "Description is required",
        }).min(5, "Description must be at least 5 characters"),
        category: zod_1.z.string({
            required_error: "Category is required",
        }),
        price: zod_1.z.coerce.number({
            required_error: "Price is required",
        }).min(0, "Price cannot be negative"),
        productImage: zod_1.z.string().optional(),
        sale: zod_1.z.boolean().optional(),
        salePrice: zod_1.z.coerce.number().min(0, "Sale price cannot be negative").optional(),
        packagingType: zod_1.z.enum(["Single", "Case"], {
            required_error: "Packaging type must be 'Single' or 'Case'",
        }),
        quantityPerCase: zod_1.z.coerce.number().min(1, "Quantity per case must be at least 1").optional(),
        refillPrice: zod_1.z.coerce.number().min(0, "Refill price cannot be negative").optional(),
        benefits: zod_1.z.array(zod_1.z.string()).optional(),
        productDetails: zod_1.z.array(zod_1.z.string()).optional(),
        status: zod_1.z.enum(["active", "draft", "archived"]).optional(),
        sku: zod_1.z.string().optional(),
        stockQuantity: zod_1.z.coerce.number().min(0).optional(),
    }),
});
const updateProductZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(2).optional(),
        slug: zod_1.z.string().optional(),
        description: zod_1.z.string().min(5).optional(),
        category: zod_1.z.string().optional(),
        price: zod_1.z.coerce.number().min(0).optional(),
        productImage: zod_1.z.string().optional(),
        sale: zod_1.z.boolean().optional(),
        salePrice: zod_1.z.coerce.number().min(0).optional(),
        packagingType: zod_1.z.enum(["Single", "Case"]).optional(),
        quantityPerCase: zod_1.z.coerce.number().min(1).optional(),
        refillPrice: zod_1.z.coerce.number().min(0).optional(),
        benefits: zod_1.z.array(zod_1.z.string()).optional(),
        productDetails: zod_1.z.array(zod_1.z.string()).optional(),
        status: zod_1.z.enum(["active", "draft", "archived"]).optional(),
        sku: zod_1.z.string().optional(),
        stockQuantity: zod_1.z.coerce.number().min(0).optional(),
        active: zod_1.z.boolean().optional(),
    }),
});
exports.ProductValidation = {
    createProductZodSchema,
    updateProductZodSchema,
};
