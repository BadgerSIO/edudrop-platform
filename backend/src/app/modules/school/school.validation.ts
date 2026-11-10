import { z } from "zod";

const AddressSchema = z.object({
  street: z.string({ required_error: "Street is required" }).min(2),
  city: z.string({ required_error: "City is required" }).min(2),
  state: z.string({ required_error: "State is required" }).min(2),
  zipCode: z.string().optional(),
});

const createSchoolZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "School name is required",
    }).min(2, "School name must be at least 2 characters"),
    slug: z.string().optional(),
    contactNo: z.string({
      required_error: "Contact number is required",
    }),
    address: AddressSchema,
    bursar: z.object({
      name: z.object({
        firstName: z.string({ required_error: "Bursar first name is required" }),
        lastName: z.string({ required_error: "Bursar last name is required" }),
      }),
      email: z.string({ required_error: "Bursar email is required" }).email("Invalid email address"),
      gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
      contactNo: z.string({ required_error: "Bursar phone number is required" }),
      password: z.string().optional(),
    }),
  }),
});

const updateSchoolZodSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    slug: z.string().optional(),
    contactNo: z.string().optional(),
    address: AddressSchema.partial().optional(),
    amountReceived: z.number().optional(),
    active: z.boolean().optional(),
    status: z.enum(["active", "pending", "suspended", "archived"]).optional(),
  }),
});

export const SchoolValidation = {
  createSchoolZodSchema,
  updateSchoolZodSchema,
};
