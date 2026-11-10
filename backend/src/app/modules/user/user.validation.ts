import { z } from "zod";

const updateUserStatusZodSchema = z.object({
  body: z.object({
    status: z.enum(["active", "suspended"], {
      required_error: "Status must be either active or suspended",
    }),
  }),
});

const resetPasswordZodSchema = z.object({
  body: z.object({
    newPassword: z
      .string({
        required_error: "New password is required",
      })
      .min(8, "Password must be at least 8 characters long"),
  }),
});

const updateUserZodSchema = z.object({
  body: z.object({
    name: z
      .object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      })
      .optional(),
    contactNo: z.string().optional(),
    presentAddress: z.string().optional(),
    permanentAddress: z.string().optional(),
  }),
});

export const UserValidation = {
  updateUserStatusZodSchema,
  resetPasswordZodSchema,
  updateUserZodSchema,
};
