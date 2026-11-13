"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonarValidation = void 0;
const zod_1 = require("zod");
const common_1 = require("../../../constants/common");
const updateDonarZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .object({
            firstName: zod_1.z
                .string()
                .trim()
                .min(1, "First name cannot be empty")
                .max(60, "First name must be under 60 characters")
                .optional(),
            lastName: zod_1.z
                .string()
                .trim()
                .min(1, "Last name cannot be empty")
                .max(60, "Last name must be under 60 characters")
                .optional(),
        })
            .optional(),
        gender: zod_1.z
            .union([zod_1.z.enum([...common_1.gender]), zod_1.z.literal("")])
            .optional(),
        contactNo: zod_1.z
            .string()
            .trim()
            .min(6, "Contact number must be at least 6 characters")
            .max(30, "Contact number must be under 30 characters")
            .regex(/^[+\d\s\-().]+$/, "Please enter a valid phone number")
            .optional(),
        address: zod_1.z
            .object({
            presentAddress: zod_1.z
                .string()
                .trim()
                .max(200, "Present address must be under 200 characters")
                .optional(),
            street: zod_1.z
                .string()
                .trim()
                .max(150, "Street address must be under 150 characters")
                .optional(),
            city: zod_1.z
                .string()
                .trim()
                .max(100, "City must be under 100 characters")
                .optional(),
            state: zod_1.z
                .string()
                .trim()
                .max(100, "State must be under 100 characters")
                .optional(),
            zipCode: zod_1.z
                .string()
                .trim()
                .max(20, "Postal / ZIP code must be under 20 characters")
                .optional(),
            country: zod_1.z
                .string()
                .trim()
                .max(100, "Country must be under 100 characters")
                .optional(),
        })
            .optional(),
        removeProfileImage: zod_1.z
            .union([zod_1.z.boolean(), zod_1.z.enum(["true", "false"])])
            .optional(),
    }),
});
exports.DonarValidation = {
    updateDonarZodSchema,
};
