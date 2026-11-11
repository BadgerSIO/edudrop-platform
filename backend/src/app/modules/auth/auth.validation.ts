import { z } from "zod";

const loginZodSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: "Email is required",
    }),
    password: z.string({
      required_error: "Password is required",
    }),
  }),
});
const signupZodSchema = z.object({
  body: z.object({
    firstName: z.string({
      required_error: "firstName is required",
    }),
    lastName: z.string({
      required_error: "lastName is required",
    }),
    email: z.string({
      required_error: "Email is required",
    }),
    contactNo: z.string({
      required_error: "contact No is required",
    }),
    password: z.string({
      required_error: "Password is required",
    }),
  }),
});
const changePasswordZodSchema = z.object({
  body: z
    .object({
      password: z
        .string({
          required_error: "Current password is required",
        })
        .min(1, "Current password is required"),
      newPassword: z
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
const ownerUnlockZodSchema = z.object({
  body: z.object({
    passkey: z
      .string({
        required_error: "Owner passkey is required",
      })
      .min(1, "Owner passkey is required"),
  }),
});

export const AuthValidation = {
  loginZodSchema,
  signupZodSchema,
  changePasswordZodSchema,
  ownerUnlockZodSchema,
};
