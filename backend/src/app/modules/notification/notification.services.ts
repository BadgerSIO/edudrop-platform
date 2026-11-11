import mongoose, { SortOrder } from "mongoose";
import httpStatus from "http-status";
import ApiError from "../../../error/ApiError";
import { paginationHelper } from "../../../helper/paginationHelper";
import { IGenericResponse } from "../../../interfaces/common";
import { IPaginationOptions } from "../../../interfaces/paginationOptions";
import { User } from "../user/user.model";
import { notificationSearchableFields } from "./notification.constants";
import {
  INotification,
  INotificationFilters,
} from "./notification.interface";
import { Notification } from "./notification.model";

const resolveActorByEmail = async (email?: string) => {
  if (!email) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized user");
  }
  const user = await User.findOne({ email }, { _id: 1, role: 1 }).lean();
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized user");
  }
  return user;
};

const assertOwnershipOrAdmin = (
  notification: { user?: mongoose.Types.ObjectId | any },
  actor: { _id: any; role?: string }
) => {
  const isOwner = String(notification.user) === String(actor._id);
  const isAdmin = actor.role === "admin";
  if (!isOwner && !isAdmin) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Forbidden: You cannot access another user's notification"
    );
  }
};

const createNotification = async (
  payload: INotification
): Promise<INotification | null> => {
  const result = await Notification.create(payload);
  return result;
};

/**
 * Non-blocking helper so side-effect notifications never crash
 * primary business transactions (orders, contact forms, school updates).
 */
const createNotificationSafe = async (
  payload: INotification
): Promise<void> => {
  try {
    await Notification.create(payload);
  } catch (err) {
    console.error("Failed to create in-app notification:", err);
  }
};

const getAllNotification = async (
  filters: INotificationFilters & { read?: boolean | string; user?: string },
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<INotification[]>> => {
  const { searchTerms, read, ...filterableData } = filters;
  const andConditions: any[] = [];

  if (searchTerms) {
    andConditions.push({
      $or: notificationSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerms,
          $options: "i",
        },
      })),
    });
  }

  if (read !== undefined && read !== "") {
    andConditions.push({ read: read === true || read === "true" });
  }

  if (Object.keys(filterableData).length) {
    andConditions.push({
      $and: Object.entries(filterableData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);
  const sortCondition: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortCondition[sortBy] = sortOrder;
  } else {
    sortCondition["createdAt"] = "desc";
  }

  const whereCondition =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const [result, total] = await Promise.all([
    Notification.find(whereCondition)
      .sort(sortCondition)
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(whereCondition),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result as INotification[],
  };
};

const getAllNotificationByUser = async (
  userEmail: string
): Promise<{
  data: INotification[];
  unreadCount: number;
}> => {
  const user = await resolveActorByEmail(userEmail);

  const [recentNotifications, unreadCount] = await Promise.all([
    Notification.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
    Notification.countDocuments({ user: user._id, read: false }),
  ]);

  return {
    data: recentNotifications as INotification[],
    unreadCount,
  };
};

const getUnreadCountByUser = async (userEmail: string): Promise<number> => {
  const user = await resolveActorByEmail(userEmail);
  return Notification.countDocuments({ user: user._id, read: false });
};

const getSingleNotificationById = async (
  id: string,
  userEmail: string
): Promise<INotification | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid notification ID");
  }
  const actor = await resolveActorByEmail(userEmail);
  const result = await Notification.findById(id).lean();
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
  }
  assertOwnershipOrAdmin(result, actor);
  return result as INotification;
};

const updateNotificationById = async (
  id: string,
  userEmail: string,
  readValue: boolean = true
): Promise<INotification | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid notification ID");
  }
  const actor = await resolveActorByEmail(userEmail);
  const existingNotification = await Notification.findById(id).lean();

  if (!existingNotification) {
    throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
  }
  assertOwnershipOrAdmin(existingNotification, actor);

  const result = await Notification.findByIdAndUpdate(
    id,
    { read: Boolean(readValue) },
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  return result as INotification | null;
};

const markAllAsRead = async (
  userEmail: string
): Promise<{ modifiedCount: number }> => {
  const user = await resolveActorByEmail(userEmail);
  const res = await Notification.updateMany(
    { user: user._id, read: false },
    { $set: { read: true } }
  );
  return { modifiedCount: res.modifiedCount || 0 };
};

const deleteNotificationById = async (
  id: string,
  userEmail: string
): Promise<INotification | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid notification ID");
  }
  const actor = await resolveActorByEmail(userEmail);
  const existing = await Notification.findById(id).lean();

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
  }
  assertOwnershipOrAdmin(existing, actor);

  const result = await Notification.findByIdAndDelete(id).lean();
  return result as unknown as INotification | null;
};

export const NotificationService = {
  createNotification,
  createNotificationSafe,
  getAllNotification,
  getSingleNotificationById,
  deleteNotificationById,
  updateNotificationById,
  getAllNotificationByUser,
  getUnreadCountByUser,
  markAllAsRead,
};
