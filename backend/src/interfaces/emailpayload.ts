import { IOrder } from "../app/modules/order/order.interface";

type IEmailPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
  username?: string;
  password?: string;
  active?: boolean;
  enabled?: boolean;
  resetToken?: string;
  orderStatus?: string;
  orderId?: string;
  paymentStatus?: boolean;
  order?: IOrder;
};
export default IEmailPayload;
