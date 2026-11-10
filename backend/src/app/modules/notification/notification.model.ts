import { Schema, model } from "mongoose";
import { INotification, NotificationModel } from "./notification.interface";

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);
export const Notification = model<INotification, NotificationModel>(
  "Notification",
  NotificationSchema
);
