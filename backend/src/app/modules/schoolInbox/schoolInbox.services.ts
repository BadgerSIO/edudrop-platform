import httpStatus from "http-status";
import { SortOrder } from "mongoose";
import { paginationHelper } from "../../../helper/paginationHelper";
import { IGenericResponse } from "../../../interfaces/common";
import { IPaginationOptions } from "../../../interfaces/paginationOptions";
import { schoolInboxSearchableFields } from "./schoolInbox.constants";
import { ISchoolInbox, ISchoolInboxFilters } from "./schoolInbox.interface";
import { SchoolInbox } from "./schoolInbox.model";
import { Bursar } from "../bursar/bursar.model";
import { transport } from "../../../config/nodemailer";
import emailTemplate from "../../../shared/emailTemplate";
import ApiError from "../../../error/ApiError";

const createSchoolInbox = async (
  payload: ISchoolInbox
): Promise<ISchoolInbox | null> => {
  const findBursar = await Bursar.findById(payload?.bursar)
    .select({
      email: 1,
    })
    .lean();

  if (!findBursar) {
    throw new ApiError(httpStatus.NOT_FOUND, "Target school bursar not found");
  }

  payload.seen = false;
  payload.status = "unread";
  payload.isDeleted = false;

  // Non-blocking try-catch for SMTP notification
  try {
    const info = await transport.sendMail({
      from: `"From ${payload.firstName}" <${payload.email}>`,
      to: findBursar.email,
      subject: `Campus Inquiry from ${payload.firstName} ${payload.lastName}`,
      text: payload.message,
      html: emailTemplate("contactForm", payload),
    });
    payload.messageId = info.messageId;
  } catch (error) {
    console.error("Failed to dispatch bursar inquiry email:", error);
  }

  const result = await SchoolInbox.create(payload);
  return result;
};

const getAllSchoolInbox = async (
  filters: ISchoolInboxFilters,
  paginationOptions: IPaginationOptions,
  email: string
): Promise<
  IGenericResponse<ISchoolInbox[]> & {
    kpis?: {
      total: number;
      unreadCount: number;
      repliedCount: number;
    };
  }
> => {
  const schoolBursar = await Bursar.findOne({ email }, { _id: 1 }).lean();
  if (!schoolBursar) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized bursar access");
  }
  const bursarId = schoolBursar._id;

  const { searchTerm, searchTerms, status, seen, isDeleted, ...filterableData } = filters;
  const term = (searchTerm || searchTerms || "").trim();

  // STRICT MULTITENANCY ENFORCEMENT:
  // Must always filter by the logged-in bursar's ID and exclude deleted items
  const andConditions: any[] = [{ bursar: bursarId }];

  if (isDeleted === "true" || isDeleted === true) {
    andConditions.push({ isDeleted: true });
  } else {
    andConditions.push({ isDeleted: { $ne: true } });
  }

  if (status && status !== "all") {
    andConditions.push({ status });
  }

  if (seen !== undefined && seen !== "all") {
    andConditions.push({ seen: seen === "true" || seen === true });
  }

  if (term) {
    andConditions.push({
      $or: schoolInboxSearchableFields.map((field) => ({
        [field]: {
          $regex: term,
          $options: "i",
        },
      })),
    });
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

  const whereCondition = { $and: andConditions };

  const [result, total, unreadCount, repliedCount] = await Promise.all([
    SchoolInbox.find(whereCondition)
      .sort(sortCondition)
      .skip(skip)
      .limit(limit)
      .lean(),
    SchoolInbox.countDocuments(whereCondition),
    SchoolInbox.countDocuments({
      bursar: bursarId,
      seen: false,
      isDeleted: { $ne: true },
    }),
    SchoolInbox.countDocuments({
      bursar: bursarId,
      status: "replied",
      isDeleted: { $ne: true },
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
    },
    kpis: {
      total,
      unreadCount,
      repliedCount,
    },
    data: result as ISchoolInbox[],
  };
};

const getSingleSubmissionById = async (
  id: string,
  email: string
): Promise<ISchoolInbox | null> => {
  const schoolBursar = await Bursar.findOne({ email }, { _id: 1 }).lean();
  if (!schoolBursar) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized bursar access");
  }

  const result = await SchoolInbox.findOne({
    _id: id,
    bursar: schoolBursar._id,
    isDeleted: { $ne: true },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Inquiry message not found");
  }

  // Automatically mark as seen/read on initial open
  if (!result.seen) {
    result.seen = true;
    if (result.status === "unread") {
      result.status = "read";
    }
    await result.save();
  }

  return result;
};

const updateSubmissionById = async (
  id: string,
  payload: Partial<ISchoolInbox>,
  email: string
): Promise<ISchoolInbox | null> => {
  const schoolBursar = await Bursar.findOne({ email }, { _id: 1 }).lean();
  if (!schoolBursar) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized bursar access");
  }

  const existing = await SchoolInbox.findOne({
    _id: id,
    bursar: schoolBursar._id,
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Inquiry message not found");
  }

  // Synchronize status and seen flags
  if (payload.seen !== undefined) {
    if (payload.seen === true && (!payload.status || payload.status === "unread")) {
      payload.status = "read";
    } else if (payload.seen === false) {
      payload.status = "unread";
    }
  }

  if (payload.status === "read" || payload.status === "replied") {
    payload.seen = true;
  } else if (payload.status === "unread") {
    payload.seen = false;
  }

  const result = await SchoolInbox.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteSubmissionById = async (
  id: string,
  email: string
): Promise<ISchoolInbox | null> => {
  const schoolBursar = await Bursar.findOne({ email }, { _id: 1 }).lean();
  if (!schoolBursar) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized bursar access");
  }

  // Soft delete preserving audit record
  const result = await SchoolInbox.findOneAndUpdate(
    { _id: id, bursar: schoolBursar._id },
    { isDeleted: true, status: "archived" },
    { new: true }
  );

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Inquiry message not found");
  }

  return result;
};

const getUnreadCount = async (email: string): Promise<number> => {
  const schoolBursar = await Bursar.findOne({ email }, { _id: 1 }).lean();
  if (!schoolBursar) {
    return 0;
  }

  const count = await SchoolInbox.countDocuments({
    bursar: schoolBursar._id,
    seen: false,
    isDeleted: { $ne: true },
  });

  return count;
};

export const SchoolInboxService = {
  createSchoolInbox,
  getAllSchoolInbox,
  getSingleSubmissionById,
  deleteSubmissionById,
  updateSubmissionById,
  getUnreadCount,
};
