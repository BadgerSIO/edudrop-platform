import { z } from "zod";

const updateAdminZodSchema = z.object({
  body: z.object({
    name: z
      .object({
        firstName: z
          .string()
          .trim()
          .min(1, "First name cannot be empty")
          .max(60, "First name must be under 60 characters")
          .optional(),
        lastName: z
          .string()
          .trim()
          .min(1, "Last name cannot be empty")
          .max(60, "Last name must be under 60 characters")
          .optional(),
      })
      .optional(),
    contactNo: z
      .string()
      .trim()
      .min(6, "Contact number must be at least 6 characters")
      .max(30, "Contact number must be under 30 characters")
      .regex(/^[+\d\s\-().]+$/, "Please enter a valid phone number")
      .optional(),
    presentAddress: z
      .string()
      .trim()
      .max(300, "Present address must be under 300 characters")
      .optional(),
    permanentAddress: z
      .string()
      .trim()
      .max(300, "Permanent address must be under 300 characters")
      .optional(),
    removeProfileImage: z
      .union([z.boolean(), z.enum(["true", "false"])])
      .optional(),
  }),
});

export const AdminValidaion = {
  updateAdminZodSchema,
};
