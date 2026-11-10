import { Model } from "mongoose";
export type Name = {
  firstName: string;
  lastName: string;
};
export type Address = {
  presentAddress?: string;
  city?: string;
  state?: string;
  street?: string;
  zipCode?: string;
  country?: string;
};
export type IDonar = {
  name: Name;
  email: string;
  gender: "male" | "female";
  contactNo: string;
  address: Address;
  enabled?: boolean;
  active?: boolean;
  profileImage?: string;
  totalDonationAmount?: number;
};
export type DonarModel = Model<IDonar, Record<string, unknown>>;
export type IDonarFilters = {
  searchTerm?: string;
  name?: string;
  email?: string;
  contactNo?: string;
};
