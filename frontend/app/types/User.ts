import { ISchool } from "./School";

export type Name = {
  firstName: string;
  lastName: string;
};

export type Address = {
  country?: string;
  presentAddress?: string;
  city?: string;
  state?: string;
  street?: string;
  zipCode?: string;
};

export type IBursar = {
  _id: string;
  email: string;
  name: Name;
  gender: "male" | "female";
  contactNo: string;
  presentAddress?: string;
  permanentAddress?: string;
  enabled?: boolean;
  active?: boolean;
  profileImage?: string;
  school?: ISchool;
  createdAt?: string;
  updatedAt?: string;
};

export type IDonar = {
  _id: string;
  name: Name;
  email: string;
  gender: "male" | "female";
  contactNo: string;
  address?: Address;
  enabled?: boolean;
  active?: boolean;
  profileImage?: string;
  totalDonationAmount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type IAdmin = {
  _id: string;
  email: string;
  name: Name;
  contactNo: string;
  presentAddress?: string;
  permanentAddress?: string;
  deviceCount?: number;
  ipAddress?: string[];
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type IUser = {
  _id: string;
  email: string;
  role: "admin" | "bursar" | "donar" | string;
  status?: "active" | "suspended" | "archived";
  isDeleted?: boolean;
  bursar?: IBursar;
  donar?: IDonar;
  admin?: IAdmin;
  profile?: (IBursar | IDonar | IAdmin) & {
    name?: Name;
    contactNo?: string;
    profileImage?: string;
    school?: ISchool;
    address?: Address;
    totalDonationAmount?: number;
  };
  recentOrders?: any[];
  donationStats?: {
    totalOrders: number;
    totalDonated: number;
  };
  createdAt?: string;
  updatedAt?: string;
};
