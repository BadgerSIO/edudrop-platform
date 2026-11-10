import { IUser } from "./User";

export type INotification = {
  _id: string;
  user: string | IUser;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};
