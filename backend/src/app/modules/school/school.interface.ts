import { Model, Types } from "mongoose";
import { IBursar } from "../bursar/bursar.interface";
export type Address = {
  street: string;
  city: string;
  state: string;
  zipCode?: string;
};

export type ISchool = {
  slug: string;
  name: string;
  bursar?: Types.ObjectId | IBursar;
  address: Address;
  contactNo: string;
  amountReceived?: number;
  active?: boolean;
  status?: "active" | "pending" | "suspended" | "archived";
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
export type SchoolModel = Model<ISchool, Record<string, unknown>>;
export type ISchoolFilters = {
  searchTerms?: string;
  name?: string;
};
