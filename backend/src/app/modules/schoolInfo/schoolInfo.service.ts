import mongoose from "mongoose";
import { ISchoolInfo } from "./schoolInfo.interface";
import { SchoolInfo } from "./schoolInfo.model";
import ApiError from "../../../error/ApiError";
import httpStatus from "http-status";
import { User } from "../user/user.model";
import { IGenericResponse } from "../../../interfaces/common";
import { School } from "../school/school.model";
import { INotification } from "../notification/notification.interface";
import { Notification } from "../notification/notification.model";
import {
  computeRemovedUrls,
  safeUnlinkUpload,
} from "../../../helper/mediaCleanupHelper";

const getAllSchool = async (): Promise<IGenericResponse<ISchoolInfo[]>> => {
  const activeSchools = await School.find({ active: true }, "_id").lean();
  const activeSchoolIds = activeSchools.map((school) => school?._id);

  const schoolInfo = await SchoolInfo.find(
    {
      school: { $in: activeSchoolIds },
    },
    {
      featuredImage: 1,
      schoolLogo: 1,
      schoolName: 1,
      shortDescription: 1,
      school: 1,
      slug: 1,
      campusNeeds: 1,
    }
  );
  return {
    data: schoolInfo,
  };
};

const updateSchoolInfoById = async (
  id: string,
  payload: Partial<ISchoolInfo>,
  currentUser?: any
): Promise<ISchoolInfo | null> => {
  // Try finding by bursar ID first, then school ID, then _id
  let existingSchoolInfo = await SchoolInfo.findOne({ bursar: id });
  if (!existingSchoolInfo && mongoose.Types.ObjectId.isValid(id)) {
    existingSchoolInfo = await SchoolInfo.findOne({
      $or: [{ _id: id }, { school: id }],
    });
  }

  if (!existingSchoolInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, "School info not found");
  }

  // Bursar ownership check
  if (currentUser && currentUser.role === "bursar") {
    if (
      String(currentUser.bursar) !== String(existingSchoolInfo.bursar)
    ) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Forbidden: You can only edit your own school profile"
      );
    }
  }

  // Collect existing image URLs before update for set-difference cleanup
  const singleImageFields: (keyof ISchoolInfo)[] = [
    "featuredImage",
    "schoolLogo",
    "heroBackgroundImage",
    "sectionOneImage",
  ];

  const oldImageUrls: (string | undefined)[] = [
    ...singleImageFields.map((field) => existingSchoolInfo[field] as string | undefined),
    ...(existingSchoolInfo.gallery || []).map((item) => item?.imageUrl),
  ];

  // Parse JSON fields if passed as serialized strings via multipart/form-data
  if (typeof payload.campusNeeds === "string") {
    try {
      payload.campusNeeds = JSON.parse(payload.campusNeeds);
    } catch {
      // ignore
    }
  }
  if (typeof payload.schoolStats === "string") {
    try {
      payload.schoolStats = JSON.parse(payload.schoolStats);
    } catch {
      // ignore
    }
  }
  if (typeof payload.achievements === "string") {
    try {
      payload.achievements = JSON.parse(payload.achievements);
    } catch {
      // ignore
    }
  }

  const fieldsToUpdate: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (
      value !== undefined &&
      Object.prototype.hasOwnProperty.call(payload, key)
    ) {
      fieldsToUpdate[key] = value;
    }
  }

  // Preserve existing gallery image URLs if only title was edited via multipart
  if (existingSchoolInfo.gallery?.length && payload.gallery?.length) {
    for (let i = 0; i < payload.gallery.length; i++) {
      const item = payload.gallery[i];
      if ((!item.imageUrl || item.imageUrl.trim() === "") && existingSchoolInfo.gallery[i]) {
        item.imageUrl = existingSchoolInfo.gallery[i].imageUrl;
      }
    }
    fieldsToUpdate.gallery = payload.gallery;
  }

  const result = await SchoolInfo.findByIdAndUpdate(
    existingSchoolInfo._id,
    { $set: fieldsToUpdate },
    {
      new: true,
      runValidators: true,
    }
  );

  if (result) {
    const retainedGallery = Array.isArray(fieldsToUpdate.gallery)
      ? fieldsToUpdate.gallery
      : existingSchoolInfo.gallery || [];

    const retainedImageUrls: (string | undefined)[] = [
      ...singleImageFields.map((field) => {
        const nextVal = fieldsToUpdate[field] as string | undefined;
        return nextVal !== undefined
          ? nextVal
          : (existingSchoolInfo[field] as string | undefined);
      }),
      ...retainedGallery.map((item: { imageUrl?: string }) => item?.imageUrl),
    ];

    const removedUrls = computeRemovedUrls(oldImageUrls, retainedImageUrls);
    await Promise.all(
      removedUrls.map((url) => safeUnlinkUpload(url, "school"))
    );

    // Notify admin asynchronously without blocking
    User.findOne({ role: "admin" }, { _id: 1 })
      .lean()
      .then((findAdmin) => {
        if (findAdmin) {
          const notificationPayloadAdmin: INotification = {
            user: findAdmin._id,
            message: `School info changed for ${result.schoolName || result.slug}`,
            link: `/dashboard/schools-list/${result.slug}`,
            read: false,
          };
          Notification.create(notificationPayloadAdmin).catch(console.error);
        }
      })
      .catch(console.error);
  }

  return result;
};

const getSingleSchoolInfoById = async (
  email: string
): Promise<ISchoolInfo | null> => {
  if (!email) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized request");
  }
  const user = await User.findOne({ email }).lean();
  if (!user || !user.bursar) {
    throw new ApiError(httpStatus.NOT_FOUND, "School bursar record not found");
  }
  const result = await SchoolInfo.findOne({ bursar: user.bursar }).populate("school");
  return result;
};

const getSingleSchoolInfoBySlug = async (
  slug: string
): Promise<ISchoolInfo | null> => {
  const result = await SchoolInfo.findOne({ slug }).populate("school");
  return result;
};

const getSingleSchoolInfoBySlugOptimized = async (
  slug: string
): Promise<ISchoolInfo | null> => {
  const school = await School.findOne({ slug }, { active: 1 }).lean();
  if (!school?.active) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "School is not currently active");
  }
  const schoolInfo = await SchoolInfo.findOne({ slug }).populate("bursar school");
  return schoolInfo;
};

export const SchoolInfoService = {
  updateSchoolInfoById,
  getSingleSchoolInfoById,
  getSingleSchoolInfoBySlug,
  getAllSchool,
  getSingleSchoolInfoBySlugOptimized,
};
