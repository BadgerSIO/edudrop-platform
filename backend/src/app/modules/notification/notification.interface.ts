import { Model, Types } from "mongoose";
import { IUser } from "../user/user.interface";

export type INotification = {
  user: Types.ObjectId | IUser;
  message: string;
  link?: string;
  read: boolean;
};
export type NotificationModel = Model<INotification, Record<string, unknown>>;
export type INotificationFilters = {
  searchTerms?: string;
};
