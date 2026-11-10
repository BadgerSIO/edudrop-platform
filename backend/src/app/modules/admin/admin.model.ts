import { Schema, model } from "mongoose";
import { IAdmin, AdminModel } from "./admin.interface";
export const AdminSchema = new Schema<IAdmin, AdminModel>(
  {
    email: { type: String, required: true },
    name: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
    },
    contactNo: { type: String, required: true },
    presentAddress: { type: String },
    permanentAddress: { type: String },
    deviceCount: { type: Number },
    ipAddress: { type: [String] },
    profileImage: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);
export const Admin = model<IAdmin, AdminModel>("Admin", AdminSchema);
