import { IProductWithQuantity } from "./Product";
import { ISchool } from "./School";
import { IDonar } from "./User";

export type IOrder = {
  _id: string;
  card?: string;
  transactionId?: string;
  orderId?: string;
  user?: IDonar;
  email: string;
  name: {
    firstName: string;
    lastName: string;
  };
  country: string;
  city: string;
  zipCode: string;
  contactNo: string;
  schoolId: ISchool;
  products: IProductWithQuantity[];
  totalAmount: number;
  payMonthly: "yes" | "no";
  nextRecurringDate: Date;
  orderStatus: "pending" | "processing" | "on the way" | "received";
  paymentStatus: boolean;
  createdAt: string;
  updatedAt: string;
};
