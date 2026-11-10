import { Model, Types } from "mongoose";
import { ISchool } from "../school/school.interface";
import { IBursar } from "../bursar/bursar.interface";

export type ICampusNeed = {
  itemTitle: string;
  productSlug?: string;
  targetQuantity: number;
  fulfilledQuantity: number;
  priority?: "high" | "medium" | "low";
};

export type ISchoolInfo = {
  school: Types.ObjectId | ISchool;
  bursar: Types.ObjectId | IBursar;
  principal: string;
  vicePrincipal: string;
  schoolWebsiteLink: string;
  slug?: string;
  schoolLogo: string;
  featuredImage: string;
  schoolName: string;
  shortDescription: string;
  heroTitle: string;
  heroBackgroundImage: string;
  sectionOneTitle: string;
  sectionOneDescription: string;
  sectionOneImage: string;
  sectionOneImageAlt: string;
  sectionTwoTitle: string;
  sectionTwoDescription: string;
  gallery: {
    imageUrl: string;
    title: string;
  }[];
  schoolStats: {
    title: string;
  }[];
  achievements: {
    title: string;
  }[];
  campusNeeds?: ICampusNeed[];
  metaTitle?: string;
  metaDescription?: string;
  schoolOther: string;
  active?: boolean;
  enabled?: boolean;
};

export type SchoolInfoModel = Model<ISchoolInfo, Record<string, unknown>>;
