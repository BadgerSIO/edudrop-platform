import { Schema, model } from "mongoose";
import { IUser, IUserMethods, UserModel } from "./user.interface";
import { securePass } from "../../../helper/securepass";

const UserSchema = new Schema<IUser, Record<string, unknown>, IUserMethods>(
  {
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    password: { type: String, required: true, select: false },
    bursar: {
      type: Schema.Types.ObjectId,
      ref: "Bursar",
    },
    donar: {
      type: Schema.Types.ObjectId,
      ref: "Donar",
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "archived"],
      default: "active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    passwordResetToken: { type: String },
    passwordResetTokenExpiry: { type: Number },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

// Compound indexes for high performance directory querying
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ isDeleted: 1, status: 1 });
UserSchema.index({ createdAt: -1 });

UserSchema.pre("save", async function (next) {
  // hashing user password if modified
  const user = this;
  if (user.isModified("password")) {
    user.password = await securePass(user?.password);
  }
  next();
});

export const User = model<IUser, UserModel>("User", UserSchema);
