import { Model, Types } from "mongoose";

export type ISubmissions = {
  _id?: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  topic?: string;
  message: string;
  seen: boolean;
  status?: "unread" | "read" | "replied" | "archived";
  isDeleted?: boolean;
  messageId?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type SubmissionsModel = Model<ISubmissions, Record<string, unknown>>;

export type ISubmissionsFilters = {
  searchTerm?: string;
  searchTerms?: string; // For backward compatibility
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  topic?: string;
  seen?: boolean | string;
  status?: string;
  isDeleted?: boolean | string;
};
