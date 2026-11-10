import httpStatus from "http-status";
import mongoose, { SortOrder } from "mongoose";
import ApiError from "../../../error/ApiError";
import { IGenericResponse } from "../../../interfaces/common";
import { IPaginationOptions } from "../../../interfaces/paginationOptions";
import { donarSearchableFields } from "./donar.constants";
import { IDonar, IDonarFilters } from "./donar.interface";
import { Donar } from "./donar.model";
import { paginationHelper } from "../../../helper/paginationHelper";
import {
  buildAllowListedSetPayload,
  resolveAvatarUpdate,
  safeUnlinkUserImage,
} from "../../../helper/profileUpdateHelper";
import { User } from "../user/user.model";

const getAllDonar = async (
  filters: IDonarFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IDonar[]>> => {
  const { searchTerm, ...filterableData } = filters;
  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      $or: donarSearchableFields.map((field) => ({
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
  const result = await Donar.find(whereCondition)
    .sort(sortCondition)
    .skip(skip)
    .limit(limit);
  const total = await Donar.countDocuments(whereCondition);
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};
const getSingleDonar = async (id: string): Promise<IDonar | null> => {
  const result = await Donar.findById(id);
  return result;
};
const deleteDonar = async (id: string): Promise<IDonar | null> => {
  // check if the donar exists
  const isExist = await Donar.findById(id);

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Donar not found !");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Soft delete user and donor to preserve historic order data
    await User.findOneAndUpdate(
      { email: isExist?.email },
      { isDeleted: true, status: "archived" },
      { session }
    );

    const result = await Donar.findOneAndUpdate(
      { _id: id },
      { active: false, enabled: false },
      { session, new: true }
    );

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};
const updateDonar = async (
  id: string,
  payload: Partial<IDonar> & { removeProfileImage?: boolean | string },
  newProfileImagePath?: string
): Promise<IDonar | null> => {
  const isExist = await Donar.findById(id, { profileImage: 1 }).lean();
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Donor not found!");
  }

  const setPayload = buildAllowListedSetPayload(
    payload as Record<string, any>,
    ["contactNo"],
    {
      name: ["firstName", "lastName"],
      address: [
        "presentAddress",
        "street",
        "city",
        "state",
        "zipCode",
        "country",
      ],
    }
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
    return Donar.findById(id);
  }

  const result = await Donar.findOneAndUpdate({ _id: id }, updateQuery, {
    new: true,
    runValidators: true,
  });

  if (oldImageToDelete) {
    await safeUnlinkUserImage(oldImageToDelete);
  }

  return result;
};
const updateDonarStatus = async (
  id: string,
  adminemail: string
): Promise<IDonar | null> => {
  const existingDonar = await Donar.findById(id, { active: 1 }).lean();

  if (!existingDonar) {
    throw new Error("Donar not found");
  }
  let updatedDonarInfo;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const updatedDonar = await Donar.findByIdAndUpdate(
      existingDonar._id,
      {
        active: !existingDonar.active,
        enabled: !existingDonar.active,
      },
      {
        new: true,
        runValidators: true,
        session,
      }
    ).select("enabled active -_id");

    updatedDonarInfo = updatedDonar;
    await session.commitTransaction();
    await session.endSession();
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
  return updatedDonarInfo;
};

export const DonarService = {
  getAllDonar,
  getSingleDonar,
  deleteDonar,
  updateDonar,
  updateDonarStatus,
};
