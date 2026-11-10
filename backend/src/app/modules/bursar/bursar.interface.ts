import { Model, Types } from "mongoose";
import { ISchool } from "../school/school.interface";
export type Name = {
  firstName: string;
  lastName: string;
};
export type IBursar = {
  email: string;
  name: Name;
  gender: "male" | "female";
  contactNo: string;
  presentAddress?: string;
  permanentAddress?: string;
  enabled?: boolean;
  active?: boolean;
  profileImage?: string;
  school?: Types.ObjectId | ISchool;
};
export type BursarModel = Model<IBursar, Record<string, unknown>>;
export type IBursarFilters = {
  searchTerm?: string;
  name?: string;
  email?: string;
  contactNo?: string;
};
