import { Schema, model } from "mongoose";
import { ISubmissions, SubmissionsModel } from "./submissions.interface";

const SubmissionsSchema = new Schema<ISubmissions>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String, required: true },
    messageId: { type: String },
    seen: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["unread", "read", "replied", "archived"],
      default: "unread",
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

SubmissionsSchema.index({ seen: 1, isDeleted: 1 });
SubmissionsSchema.index({ status: 1, isDeleted: 1 });
SubmissionsSchema.index({ createdAt: -1 });

export const Submissions = model<ISubmissions, SubmissionsModel>(
  "Submissions",
  SubmissionsSchema
);
