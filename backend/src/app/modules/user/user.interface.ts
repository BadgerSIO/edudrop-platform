import { Model, Types } from "mongoose";
import { IBursar } from "../bursar/bursar.interface";
import { IAdmin } from "../admin/admin.interface";
import { IDonar } from "../donar/donar.interface";

export type IUser = {
  _id?: Types.ObjectId;
  email: string;
  role?: string;
  password: string;
  bursar?: Types.ObjectId | IBursar;
  donar?: Types.ObjectId | IDonar;
  admin?: Types.ObjectId | IAdmin;
  status?: "active" | "suspended" | "archived";
  isDeleted?: boolean;
  passwordResetToken?: string;
  passwordResetTokenExpiry?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type IUserMethods = {
  isUserExist(email: string): Promise<boolean>;
  isPasswordMatched(
    givenPassword: string,
    savedPassword: string
  ): Promise<boolean>;
};

export type UserModel = Model<IUser, Record<string, unknown>, IUserMethods>;

export type IUserFilters = {
  searchTerm?: string;
  role?: string;
  status?: string;
  isDeleted?: boolean | string;
};
