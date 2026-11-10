import { Model, Types } from "mongoose";
import { IDonar } from "../donar/donar.interface";
import { ISchool } from "../school/school.interface";
import { IProductWithQuantity } from "../product/product.interface";

type Name = {
  firstName: string;
  lastName: string;
};
export type IOrder = {
  card: string;
  transactionId: string;
  orderId: string;
  previousOrderId?: string;
  user: Types.ObjectId | IDonar;
  email: string;
  name: Name;
  presentAddress: string;
  country: string;
  city: string;
  zipCode: string;
  contactNo: string;
  schoolId: Types.ObjectId | ISchool;
  products: IProductWithQuantity[];
  totalAmount: number;
  payMonthly: "yes" | "no";
  nextRecurringDate: Date;
  orderStatus: "pending" | "processing" | "on the way" | "received";
  paymentStatus: boolean;
  createdAt: Date; // Define the 'createdAt' field
  updatedAt: Date; // Define the 'updatedAt' field
};

export type OrderModel = Model<IOrder, Record<string, unknown>>;
export type IOrderFilters = {
  searchTerms?: string;
  email?: string;
  orderStatus?: "pending" | "processing" | "on the way" | "received";
  paymentStatus?: boolean;
  payMonthly?: "yes" | "no";
};
