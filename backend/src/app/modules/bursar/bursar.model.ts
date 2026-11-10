import { Schema, model } from "mongoose";
import { gender } from "../../../constants/common";
import { IBursar, BursarModel } from "./bursar.interface";
export const BursarSchema = new Schema<IBursar, BursarModel>(
  {
    name: {
      type: {
        firstName: {
          type: String,
          required: true,
        },
        lastName: {
          type: String,
          required: true,
        },
      },
      required: true,
    },
    gender: {
      type: String,
      enum: gender,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    contactNo: {
      type: String,
      unique: true,
      required: true,
    },
    presentAddress: {
      type: String,
    },
    permanentAddress: {
      type: String,
    },
    school: {
      type: Schema.Types.ObjectId,
      ref: "School",
    },
    enabled: { type: Boolean },
    active: { type: Boolean },
    profileImage: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);
export const Bursar = model<IBursar, BursarModel>("Bursar", BursarSchema);
