"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../error/ApiError"));
const paginationHelper_1 = require("../../../helper/paginationHelper");
const securepass_1 = require("../../../helper/securepass");
const admin_model_1 = require("../admin/admin.model");
const bursar_model_1 = require("../bursar/bursar.model");
const donar_model_1 = require("../donar/donar.model");
const order_model_1 = require("../order/order.model");
const user_model_1 = require("./user.model");
const resolveNormalizedUserStatus = (user) => {
    if (user.status === "active" ||
        user.status === "suspended" ||
        user.status === "archived") {
        return user.status;
    }
    return user.isDeleted ? "archived" : "active";
};
const getAllUsers = (filters, paginationOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm, role, status, isDeleted } = filters;
    const andConditions = [];
    // Default to non-deleted accounts unless specified
    if (isDeleted === "true" || isDeleted === true) {
        andConditions.push({ isDeleted: true });
    }
    else {
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
        }
        else {
            andConditions.push({ status });
        }
    }
    // Search across email and linked profile names/phone numbers
    if (searchTerm) {
        const searchRegex = new RegExp(searchTerm.trim(), "i");
        const [matchingDonars, matchingBursars, matchingAdmins] = yield Promise.all([
            donar_model_1.Donar.find({
                $or: [
                    { "name.firstName": searchRegex },
                    { "name.lastName": searchRegex },
                    { contactNo: searchRegex },
                    { email: searchRegex },
                ],
            }, "_id").lean(),
            bursar_model_1.Bursar.find({
                $or: [
                    { "name.firstName": searchRegex },
                    { "name.lastName": searchRegex },
                    { contactNo: searchRegex },
                    { email: searchRegex },
                ],
            }, "_id").lean(),
            admin_model_1.Admin.find({
                $or: [
                    { "name.firstName": searchRegex },
                    { "name.lastName": searchRegex },
                    { contactNo: searchRegex },
                    { email: searchRegex },
                ],
            }, "_id").lean(),
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
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    const sortCondition = {};
    if (sortBy && sortOrder) {
        sortCondition[sortBy] = sortOrder;
    }
    else {
        sortCondition["createdAt"] = "desc";
    }
    const whereCondition = andConditions.length > 0 ? { $and: andConditions } : {};
    const [rawUsers, total, totalUsers, donorCount, bursarCount, adminCount, activeCount, suspendedCount] = yield Promise.all([
        user_model_1.User.find(whereCondition)
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
        user_model_1.User.countDocuments(whereCondition),
        user_model_1.User.countDocuments({ isDeleted: { $ne: true } }),
        user_model_1.User.countDocuments({ role: "donar", isDeleted: { $ne: true } }),
        user_model_1.User.countDocuments({ role: "bursar", isDeleted: { $ne: true } }),
        user_model_1.User.countDocuments({ role: "admin", isDeleted: { $ne: true } }),
        user_model_1.User.countDocuments({
            status: { $nin: ["suspended", "archived"] },
            isDeleted: { $ne: true },
        }),
        user_model_1.User.countDocuments({ status: "suspended", isDeleted: { $ne: true } }),
    ]);
    // Normalize profile & status so `.lean()` never leaks `status: undefined` on legacy/seeded records
    const normalizedData = rawUsers.map((user) => {
        let profile = null;
        if (user.role === "donar")
            profile = user.donar;
        else if (user.role === "bursar")
            profile = user.bursar;
        else if (user.role === "admin")
            profile = user.admin;
        return Object.assign(Object.assign({}, user), { status: resolveNormalizedUserStatus(user), profile });
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
});
const getSingleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const user = yield user_model_1.User.findById(id)
        .populate("donar")
        .populate({
        path: "bursar",
        populate: { path: "school", select: "name slug schoolLogo address active campusNeeds" },
    })
        .populate("admin")
        .lean();
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User account not found");
    }
    let profile = null;
    let recentOrders = [];
    let donationStats = {
        totalOrders: 0,
        totalDonated: 0,
    };
    if (user.role === "donar") {
        profile = user.donar;
        // Fetch recent donor orders
        recentOrders = yield order_model_1.Order.find({
            $or: [{ user: (_a = user.donar) === null || _a === void 0 ? void 0 : _a._id }, { email: user.email }],
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("schoolId", "name slug")
            .lean();
        const sumResult = yield order_model_1.Order.aggregate([
            {
                $match: {
                    $or: [{ user: (_b = user.donar) === null || _b === void 0 ? void 0 : _b._id }, { email: user.email }],
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
    }
    else if (user.role === "bursar") {
        profile = user.bursar;
    }
    else if (user.role === "admin") {
        profile = user.admin;
    }
    return Object.assign(Object.assign({}, user), { status: resolveNormalizedUserStatus(user), profile,
        recentOrders,
        donationStats });
});
const updateUserStatus = (id, status, adminEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id);
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User account not found");
    }
    if (user.email === adminEmail || user.role === "admin") {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Administrative accounts cannot be suspended via status toggle");
    }
    user.status = status;
    yield user.save();
    const isActive = status === "active";
    // Bidirectional sync with role profile
    if (user.role === "donar" && user.donar) {
        yield donar_model_1.Donar.findByIdAndUpdate(user.donar, {
            active: isActive,
            enabled: isActive,
        });
    }
    else if (user.role === "bursar" && user.bursar) {
        yield bursar_model_1.Bursar.findByIdAndUpdate(user.bursar, {
            active: isActive,
            enabled: isActive,
        });
    }
    return user;
});
const resetUserPassword = (id, newPassword, adminEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id);
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User account not found");
    }
    const hashedPassword = yield (0, securepass_1.securePass)(newPassword);
    yield user_model_1.User.findByIdAndUpdate(id, {
        password: hashedPassword,
        passwordResetToken: undefined,
        passwordResetTokenExpiry: undefined,
    });
    return {
        success: true,
        message: `Password reset successfully for ${user.email}`,
    };
});
const deleteUser = (id, adminEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id);
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User account not found");
    }
    if (user.email === adminEmail) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "You cannot archive or delete your own administrative account");
    }
    // Soft deletion preserving historic relations
    user.isDeleted = true;
    user.status = "archived";
    yield user.save();
    if (user.role === "donar" && user.donar) {
        yield donar_model_1.Donar.findByIdAndUpdate(user.donar, {
            active: false,
            enabled: false,
        });
    }
    else if (user.role === "bursar" && user.bursar) {
        yield bursar_model_1.Bursar.findByIdAndUpdate(user.bursar, {
            active: false,
            enabled: false,
        });
    }
    return user;
});
exports.UserService = {
    getAllUsers,
    getSingleUser,
    updateUserStatus,
    resetUserPassword,
    deleteUser,
};
