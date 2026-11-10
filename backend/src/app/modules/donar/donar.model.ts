import { Schema, model } from "mongoose";
import { gender } from "../../../constants/common";
import { IDonar, DonarModel } from "./donar.interface";
export const DonarSchema = new Schema<IDonar, DonarModel>(
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
      required: true,
    },
    address: {
      type: {
        presentAddress: {
          type: String,
        },
        city: {
          type: String,
        },
        state: {
          type: String,
        },
        street: {
          type: String,
        },
        zipCode: {
          type: String,
        },
        country: {
          type: String,
        },
      },
    },
    enabled: { type: Boolean },
    active: { type: Boolean },
    profileImage: {
      type: String,
    },
    totalDonationAmount: { type: Number },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);
export const Donar = model<IDonar, DonarModel>("Donar", DonarSchema);
