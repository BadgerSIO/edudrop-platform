import { SortOrder } from "mongoose";
import { paginationHelper } from "../../../helper/paginationHelper";
import { IGenericResponse } from "../../../interfaces/common";
import { IPaginationOptions } from "../../../interfaces/paginationOptions";
import { notificationSearchableFields } from "./notification.constants";
import { INotification, INotificationFilters } from "./notification.interface";
import { Notification } from "./notification.model";
import ApiError from "../../../error/ApiError";
import httpStatus from "http-status";
import { User } from "../user/user.model";
const createNotification = async (
  payload: INotification
): Promise<INotification | null> => {
  const result = await Notification.create(payload);
  return result;
};
const getAllNotification = async (
  filters: INotificationFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<INotification[]>> => {
  const { searchTerms, ...filterableData } = filters;
  const andConditions = [];
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
  if (Object.keys(filterableData).length) {
    andConditions.push({
      $and: Object.entries(filterableData).map(([fields, value]) => ({
        [fields]: value,
      })),
    });
  }

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);
  const sortCondition: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortCondition[sortBy] = sortOrder;
  }
  const whereCondition =
    andConditions?.length > 0 ? { $and: andConditions } : {};
  const result = await Notification.find(whereCondition)
    .sort(sortCondition)
    .skip(skip)
    .limit(limit);
  const total = await Notification.countDocuments();
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};
const getAllNotificationByUser = async (
  userEmail: string
): Promise<IGenericResponse<INotification[]>> => {
  if (!userEmail) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized user");
  }
  const user = await User.findOne({ email: userEmail }, { _id: 1 }).lean();
  const result = await Notification.find({ user: user?._id, read: false }).sort(
    {
      createdAt: -1,
    }
  );
  return { data: result };
};
const getSingleNotificationById = async (
  id: string
): Promise<INotification | null> => {
  const result = await Notification.findById(id);
  return result;
};
const updateNotificationById = async (
  id: string
): Promise<INotification | null> => {
  const existingNotification = await Notification.findById(id);

  if (!existingNotification) {
    throw new Error("Notification not found");
  }
  const result = await Notification.findByIdAndUpdate(
    id,
    { read: true },
    {
      new: true,
      runValidators: true,
    }
  );
  return result;
};

const deleteNotificationById = async (
  id: string
): Promise<INotification | null> => {
  const result = await Notification.findByIdAndDelete(id);
  return result as unknown as INotification | null; // Explicitly cast to INotification or null
};

export const NotificationService = {
  createNotification,
  getAllNotification,
  getSingleNotificationById,
  deleteNotificationById,
  updateNotificationById,
  getAllNotificationByUser,
};
