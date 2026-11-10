import { Model, Types } from "mongoose";
import { IBursar } from "../bursar/bursar.interface";

export type ISchoolInbox = {
  _id?: Types.ObjectId;
  bursar?: Types.ObjectId | IBursar;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
  seen: boolean;
  status?: "unread" | "read" | "replied" | "archived";
  isDeleted?: boolean;
  messageId?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type SchoolInboxModel = Model<ISchoolInbox, Record<string, unknown>>;

export type ISchoolInboxFilters = {
  searchTerm?: string;
  searchTerms?: string; // For backward compatibility
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  seen?: boolean | string;
  status?: string;
  isDeleted?: boolean | string;
};
