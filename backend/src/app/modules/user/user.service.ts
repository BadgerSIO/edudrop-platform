import httpStatus from "http-status";
import { SortOrder } from "mongoose";
import ApiError from "../../../error/ApiError";
import { paginationHelper } from "../../../helper/paginationHelper";
import { securePass } from "../../../helper/securepass";
import { IGenericResponse } from "../../../interfaces/common";
import { IPaginationOptions } from "../../../interfaces/paginationOptions";
import { Admin } from "../admin/admin.model";
import { Bursar } from "../bursar/bursar.model";
import { Donar } from "../donar/donar.model";
import { Order } from "../order/order.model";
import { IUser, IUserFilters } from "./user.interface";
import { User } from "./user.model";

const resolveNormalizedUserStatus = (user: {
  status?: string;
  isDeleted?: boolean;
}): "active" | "suspended" | "archived" => {
  if (
    user.status === "active" ||
    user.status === "suspended" ||
    user.status === "archived"
  ) {
    return user.status;
  }
  return user.isDeleted ? "archived" : "active";
};

const getAllUsers = async (
  filters: IUserFilters,
  paginationOptions: IPaginationOptions
): Promise<
  IGenericResponse<IUser[]> & {
    kpis?: {
      totalUsers: number;
      donorCount: number;
      bursarCount: number;
      adminCount: number;
      activeCount: number;
      suspendedCount: number;
    };
  }
> => {
  const { searchTerm, role, status, isDeleted } = filters;
  const andConditions: any[] = [];

  // Default to non-deleted accounts unless specified
  if (isDeleted === "true" || isDeleted === true) {
    andConditions.push({ isDeleted: true });
  } else {
    andConditions.push({ isDeleted: { $ne: true } });
  }

  // Role filter
  if (role && role !== "all") {
    andConditions.push({ role });
  }

  // Status filter (treat missing legacy status on non-deleted accounts as active)
  if (status && status !== "all") {
    if (status === "active") {
      andConditions.push({
        $or: [
          { status: "active" },
          { status: { $exists: false }, isDeleted: { $ne: true } },
        ],
      });
    } else {
      andConditions.push({ status });
    }
  }

  // Search across email and linked profile names/phone numbers
  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm.trim(), "i");
    const [matchingDonars, matchingBursars, matchingAdmins] = await Promise.all([
      Donar.find(
        {
          $or: [
            { "name.firstName": searchRegex },
            { "name.lastName": searchRegex },
            { contactNo: searchRegex },
            { email: searchRegex },
          ],
        },
        "_id"
      ).lean(),
      Bursar.find(
        {
          $or: [
            { "name.firstName": searchRegex },
            { "name.lastName": searchRegex },
            { contactNo: searchRegex },
            { email: searchRegex },
          ],
        },
        "_id"
      ).lean(),
      Admin.find(
        {
          $or: [
            { "name.firstName": searchRegex },
            { "name.lastName": searchRegex },
            { contactNo: searchRegex },
            { email: searchRegex },
          ],
        },
        "_id"
      ).lean(),
    ]);

    const donarIds = matchingDonars.map((d) => d._id);
    const bursarIds = matchingBursars.map((b) => b._id);
    const adminIds = matchingAdmins.map((a) => a._id);

    andConditions.push({
      $or: [
        { email: searchRegex },
        { donar: { $in: donarIds } },
        { bursar: { $in: bursarIds } },
        { admin: { $in: adminIds } },
      ],
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

  const whereCondition = andConditions.length > 0 ? { $and: andConditions } : {};

  const [rawUsers, total, totalUsers, donorCount, bursarCount, adminCount, activeCount, suspendedCount] =
    await Promise.all([
      User.find(whereCondition)
        .populate("donar")
        .populate({
          path: "bursar",
          populate: { path: "school", select: "name slug schoolLogo address active" },
        })
        .populate("admin")
        .sort(sortCondition)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(whereCondition),
      User.countDocuments({ isDeleted: { $ne: true } }),
      User.countDocuments({ role: "donar", isDeleted: { $ne: true } }),
      User.countDocuments({ role: "bursar", isDeleted: { $ne: true } }),
      User.countDocuments({ role: "admin", isDeleted: { $ne: true } }),
      User.countDocuments({
        status: { $nin: ["suspended", "archived"] },
        isDeleted: { $ne: true },
      }),
      User.countDocuments({ status: "suspended", isDeleted: { $ne: true } }),
    ]);

  // Normalize profile & status so `.lean()` never leaks `status: undefined` on legacy/seeded records
  const normalizedData: any[] = rawUsers.map((user: any) => {
    let profile = null;
    if (user.role === "donar") profile = user.donar;
    else if (user.role === "bursar") profile = user.bursar;
    else if (user.role === "admin") profile = user.admin;

    return {
      ...user,
      status: resolveNormalizedUserStatus(user),
      profile,
    };
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    kpis: {
      totalUsers,
      donorCount,
      bursarCount,
      adminCount,
      activeCount,
      suspendedCount,
    },
    data: normalizedData,
  };
};

const getSingleUser = async (id: string): Promise<any | null> => {
  const user = await User.findById(id)
    .populate("donar")
    .populate({
      path: "bursar",
      populate: { path: "school", select: "name slug schoolLogo address active campusNeeds" },
    })
    .populate("admin")
    .lean();

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User account not found");
  }

  let profile = null;
  let recentOrders: any[] = [];
  let donationStats = {
    totalOrders: 0,
    totalDonated: 0,
  };

  if (user.role === "donar") {
    profile = user.donar;
    // Fetch recent donor orders
    recentOrders = await Order.find({
      $or: [{ user: (user.donar as any)?._id }, { email: user.email }],
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("schoolId", "name slug")
      .lean();

    const sumResult = await Order.aggregate([
      {
        $match: {
          $or: [{ user: (user.donar as any)?._id }, { email: user.email }],
          paymentStatus: true,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (sumResult.length > 0) {
      donationStats.totalDonated = sumResult[0].total || 0;
      donationStats.totalOrders = sumResult[0].count || 0;
    }
  } else if (user.role === "bursar") {
    profile = user.bursar;
  } else if (user.role === "admin") {
    profile = user.admin;
  }

  return {
    ...user,
    status: resolveNormalizedUserStatus(user),
    profile,
    recentOrders,
    donationStats,
  };
};

const updateUserStatus = async (
  id: string,
  status: "active" | "suspended",
  adminEmail: string
): Promise<IUser | null> => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User account not found");
  }

  if (user.email === adminEmail || user.role === "admin") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Administrative accounts cannot be suspended via status toggle"
    );
  }

  user.status = status;
  await user.save();

  const isActive = status === "active";

  // Bidirectional sync with role profile
  if (user.role === "donar" && user.donar) {
    await Donar.findByIdAndUpdate(user.donar, {
      active: isActive,
      enabled: isActive,
    });
  } else if (user.role === "bursar" && user.bursar) {
    await Bursar.findByIdAndUpdate(user.bursar, {
      active: isActive,
      enabled: isActive,
    });
  }

  return user;
};

const resetUserPassword = async (
  id: string,
  newPassword: string,
  adminEmail: string
): Promise<{ success: boolean; message: string }> => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User account not found");
  }

  const hashedPassword = await securePass(newPassword);
  await User.findByIdAndUpdate(id, {
    password: hashedPassword,
    passwordResetToken: undefined,
    passwordResetTokenExpiry: undefined,
  });

  return {
    success: true,
    message: `Password reset successfully for ${user.email}`,
  };
};

const deleteUser = async (
  id: string,
  adminEmail: string
): Promise<IUser | null> => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User account not found");
  }

  if (user.email === adminEmail) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You cannot archive or delete your own administrative account"
    );
  }

  // Soft deletion preserving historic relations
  user.isDeleted = true;
  user.status = "archived";
  await user.save();

  if (user.role === "donar" && user.donar) {
    await Donar.findByIdAndUpdate(user.donar, {
      active: false,
      enabled: false,
    });
  } else if (user.role === "bursar" && user.bursar) {
    await Bursar.findByIdAndUpdate(user.bursar, {
      active: false,
      enabled: false,
    });
  }

  return user;
};

export const UserService = {
  getAllUsers,
  getSingleUser,
  updateUserStatus,
  resetUserPassword,
  deleteUser,
};
