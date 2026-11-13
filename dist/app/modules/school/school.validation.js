"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolValidation = void 0;
const zod_1 = require("zod");
const AddressSchema = zod_1.z.object({
    street: zod_1.z.string({ required_error: "Street is required" }).min(2),
    city: zod_1.z.string({ required_error: "City is required" }).min(2),
    state: zod_1.z.string({ required_error: "State is required" }).min(2),
    zipCode: zod_1.z.string().optional(),
});
const createSchoolZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: "School name is required",
        }).min(2, "School name must be at least 2 characters"),
        slug: zod_1.z.string().optional(),
        contactNo: zod_1.z.string({
            required_error: "Contact number is required",
        }),
        address: AddressSchema,
        bursar: zod_1.z.object({
            name: zod_1.z.object({
                firstName: zod_1.z.string({ required_error: "Bursar first name is required" }),
                lastName: zod_1.z.string({ required_error: "Bursar last name is required" }),
            }),
            email: zod_1.z.string({ required_error: "Bursar email is required" }).email("Invalid email address"),
            gender: zod_1.z.enum(["male", "female"], { required_error: "Gender is required" }),
            contactNo: zod_1.z.string({ required_error: "Bursar phone number is required" }),
            password: zod_1.z.string().optional(),
        }),
    }),
});
const updateSchoolZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        slug: zod_1.z.string().optional(),
        contactNo: zod_1.z.string().optional(),
        address: AddressSchema.partial().optional(),
        amountReceived: zod_1.z.number().optional(),
        active: zod_1.z.boolean().optional(),
        status: zod_1.z.enum(["active", "pending", "suspended", "archived"]).optional(),
    }),
});
exports.SchoolValidation = {
    createSchoolZodSchema,
    updateSchoolZodSchema,
};
