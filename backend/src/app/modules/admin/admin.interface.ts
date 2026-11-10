import { Model } from "mongoose";
export type Name = {
  firstName: string;
  lastName: string;
};
export type IAdmin = {
  email: string;
  name: Name;
  contactNo: string;
  presentAddress?: string;
  permanentAddress?: string;
  deviceCount?: number;
  ipAddress?: string[];
  profileImage?: string;
};
export type AdminModel = Model<IAdmin, Record<string, unknown>>;
