import httpStatus from "http-status";
import { SortOrder } from "mongoose";
import ApiError from "../../../error/ApiError";
import { paginationHelper } from "../../../helper/paginationHelper";
import { IGenericResponse } from "../../../interfaces/common";
import { IPaginationOptions } from "../../../interfaces/paginationOptions";
import { submissionsSearchableFields } from "./submissions.constants";
import { ISubmissions, ISubmissionsFilters } from "./submissions.interface";
import { Submissions } from "./submissions.model";
import { transport } from "../../../config/nodemailer";
import { User } from "../user/user.model";
import emailTemplate from "../../../shared/emailTemplate";

const createSubmissions = async (
  payload: ISubmissions
): Promise<ISubmissions | null> => {
  const submissionData: ISubmissions = {
    firstName: String(payload.firstName || "").trim(),
    lastName: String(payload.lastName || "").trim(),
    email: String(payload.email || "").trim(),
    phone: payload.phone ? String(payload.phone).trim() : undefined,
    topic: payload.topic ? String(payload.topic).trim() : undefined,
    message: String(payload.message || "").trim(),
    seen: false,
    status: "unread",
    isDeleted: false,
  };

  // Non-blocking try-catch for admin SMTP notification
  try {
    const admin = await User.findOne({ role: "admin" }, { email: 1 }).lean();
    if (admin) {
      const topicTag = submissionData.topic ? ` [${submissionData.topic}]` : "";
      const info = await transport.sendMail({
        from: `"EduDrop Platform Inquiry" <${submissionData.email}>`,
        to: admin.email,
        subject: `Platform Inquiry${topicTag} from ${submissionData.firstName} ${submissionData.lastName}`,
        text: submissionData.message,
        html: emailTemplate("contactForm", submissionData),
      });
      submissionData.messageId = info.messageId;
    }
  } catch (error) {
    console.error("Failed to dispatch admin inquiry email:", error);
  }

  const result = await Submissions.create(submissionData);
  return result;
};

const getAllSubmissions = async (
  filters: ISubmissionsFilters,
  paginationOptions: IPaginationOptions
): Promise<
  IGenericResponse<ISubmissions[]> & {
    kpis?: {
      total: number;
      unreadCount: number;
      repliedCount: number;
    };
  }
> => {
  const { searchTerm, searchTerms, status, seen, isDeleted, ...filterableData } = filters;
  const term = (searchTerm || searchTerms || "").trim();

  const andConditions: any[] = [];

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
      $or: submissionsSearchableFields.map((field) => ({
        [field]: {
          $regex: term,
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
  } else {
    sortCondition["createdAt"] = "desc";
  }

  const whereCondition =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const [result, total, unreadCount, repliedCount] = await Promise.all([
    Submissions.find(whereCondition)
      .sort(sortCondition)
      .skip(skip)
      .limit(limit)
      .lean(),
    Submissions.countDocuments(whereCondition),
    Submissions.countDocuments({ seen: false, isDeleted: { $ne: true } }),
    Submissions.countDocuments({ status: "replied", isDeleted: { $ne: true } }),
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
    data: result as ISubmissions[],
  };
};

const getSingleSubmissionById = async (
  id: string
): Promise<ISubmissions | null> => {
  const result = await Submissions.findOne({
    _id: id,
    isDeleted: { $ne: true },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Submission message not found");
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
  payload: Partial<ISubmissions>
): Promise<ISubmissions | null> => {
  const existing = await Submissions.findById(id);

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Submission message not found");
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

  const result = await Submissions.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteSubmissionById = async (
  id: string
): Promise<ISubmissions | null> => {
  // Soft delete preserving audit record
  const result = await Submissions.findByIdAndUpdate(
    id,
    { isDeleted: true, status: "archived" },
    { new: true }
  );

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Submission message not found");
  }

  return result;
};

const getUnreadCount = async (): Promise<number> => {
  const count = await Submissions.countDocuments({
    seen: false,
    isDeleted: { $ne: true },
  });
  return count;
};

export const SubmissionsService = {
  createSubmissions,
  getAllSubmissions,
  getSingleSubmissionById,
  deleteSubmissionById,
  updateSubmissionById,
  getUnreadCount,
};
