import { Schema, model } from "mongoose";
import { IOrder, OrderModel } from "./order.interface";
import { User } from "../user/user.model";
import { senderMail, transport } from "../../../config/nodemailer";
import emailTemplate from "../../../shared/emailTemplate";
import { School } from "../school/school.model";
import ApiError from "../../../error/ApiError";
import httpStatus from "http-status";
import { INotification } from "../notification/notification.interface";
import { Notification } from "../notification/notification.model";

const OrderSchema = new Schema<IOrder>(
  {
    card: { type: String },
    transactionId: { type: String, trim: true, index: true },
    orderId: { type: String, trim: true, unique: true, sparse: true },
    previousOrderId: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "Donar" },
    email: { type: String, required: true },
    name: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
    },
    presentAddress: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String },
    contactNo: { type: String, required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: "School" },
    products: [{ type: Schema.Types.Mixed }], // Define this as per your IProductWithQuantity structure
    totalAmount: { type: Number, required: true },
    payMonthly: { type: String, enum: ["yes", "no"], required: true },
    nextRecurringDate: {
      type: Date,
      // Set the 'required' flag based on the 'payMonthly' value
      required: function () {
        return this.payMonthly === "yes"; // Make 'nextRecurringDate' required only when payMonthly is 'yes'
      },
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "on the way", "received"],
      required: true,
    },
    paymentStatus: { type: Boolean, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);
OrderSchema.pre("save", async function (next) {
  const order = this;
  if (!order.isNew) {
    return next();
  }
  try {
    const findBursar = await School.findById(
      { _id: order.schoolId },
      { bursar: 1 }
    ).lean();

    const [findBursarUser, findAdmin, findDonarUser] = await Promise.all([
      findBursar?.bursar
        ? User.findOne(
            { bursar: findBursar.bursar },
            { _id: 1, email: 1 }
          ).lean()
        : Promise.resolve(null),
      User.findOne({ role: "admin" }, { _id: 1, email: 1 }).lean(),
      order.user
        ? User.findOne({ donar: order.user }, { _id: 1 }).lean()
        : Promise.resolve(null),
    ]);

    const orderLabel = order.orderId || "Sponsorship";
    const routeKey = order.orderId || order._id;
    const notificationPromises: Promise<any>[] = [];

    if (findBursarUser) {
      const notificationPayload: INotification = {
        user: findBursarUser._id,
        message: `New Order placed: ${orderLabel}`,
        link: `/bursar-dashboard/my-orders/${routeKey}`,
        read: false,
      };
      notificationPromises.push(
        Notification.create(notificationPayload).catch(console.error)
      );
    }

    if (findAdmin) {
      const notificationPayloadAdmin: INotification = {
        user: findAdmin._id,
        message: `New Order placed: ${orderLabel}`,
        link: `/dashboard/orders/${routeKey}`,
        read: false,
      };
      notificationPromises.push(
        Notification.create(notificationPayloadAdmin).catch(console.error)
      );
    }

    if (findDonarUser) {
      const notificationPayloadDonar: INotification = {
        user: findDonarUser._id,
        message: `Sponsorship order received: ${orderLabel}`,
        link: `/donar-dashboard/my-orders/${routeKey}`,
        read: false,
      };
      notificationPromises.push(
        Notification.create(notificationPayloadDonar).catch(console.error)
      );
    }

    await Promise.all(notificationPromises);

    const recipients = [order.email];
    if (findAdmin?.email) recipients.push(findAdmin.email);
    if (findBursarUser?.email) recipients.push(findBursarUser.email);

    const emailPayload = { order };
    await transport.sendMail({
      from: `${senderMail}`,
      to: recipients,
      subject: `New Sponsorship Order Confirmation: ${order.orderId || ""}`,
      text: "New EduDrop sponsorship order received",
      html: emailTemplate("newOrder", emailPayload),
    }).catch(console.error);
  } catch (error) {
    console.error("Non-critical error in order post-save hooks:", error);
  }
  next();
});
export const Order = model<IOrder, OrderModel>("Order", OrderSchema);
