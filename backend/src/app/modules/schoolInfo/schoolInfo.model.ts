import { Schema, model } from "mongoose";
import { ISchoolInfo, SchoolInfoModel } from "./schoolInfo.interface";

const SchoolInfoSchema = new Schema<ISchoolInfo>(
  {
    school: {
      type: Schema.Types.ObjectId,
      ref: "School",
    },
    bursar: {
      type: Schema.Types.ObjectId,
      ref: "Bursar",
    },
    principal: { type: String },
    vicePrincipal: { type: String },
    schoolWebsiteLink: { type: String },
    featuredImage: { type: String },
    schoolName: { type: String },
    slug: { type: String },
    shortDescription: { type: String },
    heroTitle: { type: String },
    heroBackgroundImage: { type: String },
    sectionOneTitle: { type: String },
    sectionOneDescription: { type: String },
    sectionOneImage: { type: String },
    sectionOneImageAlt: { type: String },
    sectionTwoTitle: { type: String },
    sectionTwoDescription: { type: String },
    gallery: [
      {
        imageUrl: { type: String },
        title: { type: String },
      },
    ],
    schoolLogo: { type: String },
    schoolStats: [
      {
        title: { type: String },
      },
    ],
    achievements: [
      {
        title: { type: String },
      },
    ],
    campusNeeds: [
      {
        itemTitle: { type: String, required: true },
        productSlug: { type: String },
        targetQuantity: { type: Number, required: true, default: 0 },
        fulfilledQuantity: { type: Number, required: true, default: 0 },
        priority: {
          type: String,
          enum: ["high", "medium", "low"],
          default: "medium",
        },
      },
    ],
    metaTitle: { type: String },
    metaDescription: { type: String },
    schoolOther: { type: String },
    enabled: { type: Boolean },
    active: { type: Boolean },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

SchoolInfoSchema.index({ slug: 1 }, { background: true });
SchoolInfoSchema.index({ bursar: 1 }, { background: true });
SchoolInfoSchema.index({ school: 1 }, { background: true });

export const SchoolInfo = model<ISchoolInfo, SchoolInfoModel>(
  "SchoolInfo",
  SchoolInfoSchema
);
