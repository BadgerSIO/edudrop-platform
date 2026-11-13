"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminValidaion = void 0;
const zod_1 = require("zod");
const updateAdminZodSchema = zod_1.z.object({
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
        contactNo: zod_1.z
            .string()
            .trim()
            .min(6, "Contact number must be at least 6 characters")
            .max(30, "Contact number must be under 30 characters")
            .regex(/^[+\d\s\-().]+$/, "Please enter a valid phone number")
            .optional(),
        presentAddress: zod_1.z
            .string()
            .trim()
            .max(300, "Present address must be under 300 characters")
            .optional(),
        permanentAddress: zod_1.z
            .string()
            .trim()
            .max(300, "Permanent address must be under 300 characters")
            .optional(),
        removeProfileImage: zod_1.z
            .union([zod_1.z.boolean(), zod_1.z.enum(["true", "false"])])
            .optional(),
    }),
});
exports.AdminValidaion = {
    updateAdminZodSchema,
};
