"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderValidation = exports.createOrderSchema = void 0;
const z = __importStar(require("zod"));
const mongoose_1 = require("mongoose");
const ProductWithQuantitySchema = z.object({
    title: z.string(),
    slug: z.string(),
    category: z.union([
        z.string(),
        z.instanceof(mongoose_1.Types.ObjectId),
    ]),
    price: z.number(),
    productImage: z.string(),
    sale: z.optional(z.boolean()),
    salePrice: z.optional(z.number()),
    quantity: z.number(), // Quantity added for IProductWithQuantity
});
exports.createOrderSchema = z.object({
    body: z.object({
        card: z.string().optional(),
        transactionId: z.string().optional(),
        orderId: z.string().optional(),
        user: z.optional(z.union([
            z.string(),
            z.instanceof(mongoose_1.Types.ObjectId),
        ])),
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
            z.instanceof(mongoose_1.Types.ObjectId),
        ]),
        products: z.array(ProductWithQuantitySchema),
        totalAmount: z.number().positive(),
        payMonthly: z.literal("yes").or(z.literal("no")),
    }),
});
exports.OrderValidation = {
    createOrderSchema: exports.createOrderSchema,
};
