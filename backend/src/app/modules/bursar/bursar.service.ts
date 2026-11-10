import httpStatus from "http-status";
import mongoose, { SortOrder } from "mongoose";
import ApiError from "../../../error/ApiError";
import { IGenericResponse } from "../../../interfaces/common";
import { IPaginationOptions } from "../../../interfaces/paginationOptions";
import { bursarSearchableFields } from "./bursar.constants";
import { IBursar, IBursarFilters } from "./bursar.interface";
import { Bursar } from "./bursar.model";
import { paginationHelper } from "../../../helper/paginationHelper";
import {
  buildAllowListedSetPayload,
  resolveAvatarUpdate,
  safeUnlinkUserImage,
} from "../../../helper/profileUpdateHelper";
import { User } from "../user/user.model";

const getAllBursar = async (
  filters: IBursarFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IBursar[]>> => {
  const { searchTerm, ...filterableData } = filters;
  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      $or: bursarSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
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
  const result = await Bursar.find(whereCondition)
    .populate("school")
    .sort(sortCondition)
    .skip(skip)
    .limit(limit);
  const total = await Bursar.countDocuments(whereCondition);
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};
const getSingleBursar = async (id: string): Promise<IBursar | null> => {
  const result = await Bursar.findById(id).populate("school");
  return result;
};
const deleteBursar = async (id: string): Promise<IBursar | null> => {
  // check if the bursar exists
  const isExist = await Bursar.findById(id);

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Bursar not found !");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Soft delete user account
    await User.findOneAndUpdate(
      { email: isExist?.email },
      { isDeleted: true, status: "archived" },
      { session }
    );

    const bursar = await Bursar.findByIdAndUpdate(
      id,
      { active: false, enabled: false },
      { session, new: true }
    );

    await session.commitTransaction();
    await session.endSession();

    return bursar;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};
const updateBursar = async (
  id: string,
  payload: Partial<IBursar> & { removeProfileImage?: boolean | string },
  newProfileImagePath?: string
): Promise<IBursar | null> => {
  const isExist = await Bursar.findById(id, { profileImage: 1 }).lean();
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Bursar not found!");
  }

  const setPayload = buildAllowListedSetPayload(
    payload as Record<string, any>,
    ["contactNo", "presentAddress", "permanentAddress"],
    { name: ["firstName", "lastName"] }
  );

  const unsetPayload: Record<string, 1> = {};
  if ((payload.gender as any) === "") {
    unsetPayload.gender = 1;
  } else if (payload.gender) {
    setPayload.gender = payload.gender;
  }

  const { nextProfileImage, oldImageToDelete } = resolveAvatarUpdate(
    isExist.profileImage,
    newProfileImagePath,
    payload.removeProfileImage
  );

  if (nextProfileImage !== undefined) {
    setPayload.profileImage = nextProfileImage;
  }

  const updateQuery: Record<string, any> = {};
  if (Object.keys(setPayload).length > 0) {
    updateQuery.$set = setPayload;
  }
  if (Object.keys(unsetPayload).length > 0) {
    updateQuery.$unset = unsetPayload;
  }

  if (Object.keys(updateQuery).length === 0) {
    return Bursar.findById(id).populate("school");
  }

  const result = await Bursar.findOneAndUpdate({ _id: id }, updateQuery, {
    new: true,
    runValidators: true,
  }).populate("school");

  if (oldImageToDelete) {
    await safeUnlinkUserImage(oldImageToDelete);
  }

  return result;
};
export const BursarService = {
  getAllBursar,
  getSingleBursar,
  deleteBursar,
  updateBursar,
};
