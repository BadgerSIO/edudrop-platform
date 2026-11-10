import * as z from "zod";
import { Types } from "mongoose";

const ProductWithQuantitySchema = z.object({
  title: z.string(),
  slug: z.string(),
  category: z.union([
    z.string(),
    z.instanceof(Types.ObjectId) as z.ZodType<Types.ObjectId, any>,
  ]),
  price: z.number(),
  productImage: z.string(),
  sale: z.optional(z.boolean()),
  salePrice: z.optional(z.number()),
  quantity: z.number(), // Quantity added for IProductWithQuantity
});
export const createOrderSchema = z.object({
  body: z.object({
    card: z.string().optional(),
    transactionId: z.string().optional(),
    orderId: z.string().optional(),
    user: z.optional(
      z.union([
        z.string(),
        z.instanceof(Types.ObjectId) as z.ZodType<Types.ObjectId, any>,
      ])
    ),
    email: z.string().email(),
    name: z.object({
      firstName: z.string(),
      lastName: z.string(),
    }),
    presentAddress: z.string(),
    country: z.string(),
    city: z.string(),
    zipCode: z.string(),
    contactNo: z.string(),
    schoolId: z.union([
      z.string(),
      z.instanceof(Types.ObjectId) as z.ZodType<Types.ObjectId, any>,
    ]),
    products: z.array(ProductWithQuantitySchema),
    totalAmount: z.number().positive(),
    payMonthly: z.literal("yes").or(z.literal("no")),
  }),
});

export type IOrder = z.infer<typeof createOrderSchema>;
export const OrderValidation = {
  createOrderSchema,
};
