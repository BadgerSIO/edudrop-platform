import { z } from "zod";
import { gender } from "../../../constants/common";

const updateDonarZodSchema = z.object({
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
    gender: z
      .union([z.enum([...gender] as [string, ...string[]]), z.literal("")])
      .optional(),
    contactNo: z
      .string()
      .trim()
      .min(6, "Contact number must be at least 6 characters")
      .max(30, "Contact number must be under 30 characters")
      .regex(/^[+\d\s\-().]+$/, "Please enter a valid phone number")
      .optional(),
    address: z
      .object({
        presentAddress: z
          .string()
          .trim()
          .max(200, "Present address must be under 200 characters")
          .optional(),
        street: z
          .string()
          .trim()
          .max(150, "Street address must be under 150 characters")
          .optional(),
        city: z
          .string()
          .trim()
          .max(100, "City must be under 100 characters")
          .optional(),
        state: z
          .string()
          .trim()
          .max(100, "State must be under 100 characters")
          .optional(),
        zipCode: z
          .string()
          .trim()
          .max(20, "Postal / ZIP code must be under 20 characters")
          .optional(),
        country: z
          .string()
          .trim()
          .max(100, "Country must be under 100 characters")
          .optional(),
      })
      .optional(),
    removeProfileImage: z
      .union([z.boolean(), z.enum(["true", "false"])])
      .optional(),
  }),
});

export const DonarValidation = {
  updateDonarZodSchema,
};
