"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidation = void 0;
const zod_1 = require("zod");
const loginZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({
            required_error: "Email is required",
        }),
        password: zod_1.z.string({
            required_error: "Password is required",
        }),
    }),
});
const signupZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string({
            required_error: "firstName is required",
        }),
        lastName: zod_1.z.string({
            required_error: "lastName is required",
        }),
        email: zod_1.z.string({
            required_error: "Email is required",
        }),
        contactNo: zod_1.z.string({
            required_error: "contact No is required",
        }),
        password: zod_1.z.string({
            required_error: "Password is required",
        }),
    }),
});
const changePasswordZodSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        password: zod_1.z
            .string({
            required_error: "Current password is required",
        })
            .min(1, "Current password is required"),
        newPassword: zod_1.z
            .string({
            required_error: "New password is required",
        })
            .min(8, "New password must be at least 8 characters long")
            .max(128, "New password must be under 128 characters"),
    })
        .refine((data) => data.newPassword !== data.password, {
        message: "New password must be different from your current password",
        path: ["newPassword"],
    }),
});
const ownerUnlockZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        passkey: zod_1.z
            .string({
            required_error: "Owner passkey is required",
        })
            .min(1, "Owner passkey is required"),
    }),
});
exports.AuthValidation = {
    loginZodSchema,
    signupZodSchema,
    changePasswordZodSchema,
    ownerUnlockZodSchema,
};
