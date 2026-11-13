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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../error/ApiError"));
const paginationHelper_1 = require("../../../helper/paginationHelper");
const user_model_1 = require("../user/user.model");
const notification_constants_1 = require("./notification.constants");
const notification_model_1 = require("./notification.model");
const resolveActorByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized user");
    }
    const user = yield user_model_1.User.findOne({ email }, { _id: 1, role: 1 }).lean();
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized user");
    }
    return user;
});
const assertOwnershipOrAdmin = (notification, actor) => {
    const isOwner = String(notification.user) === String(actor._id);
    const isAdmin = actor.role === "admin";
    if (!isOwner && !isAdmin) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden: You cannot access another user's notification");
    }
};
const createNotification = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.Notification.create(payload);
    return result;
});
/**
 * Non-blocking helper so side-effect notifications never crash
 * primary business transactions (orders, contact forms, school updates).
 */
const createNotificationSafe = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield notification_model_1.Notification.create(payload);
    }
    catch (err) {
        console.error("Failed to create in-app notification:", err);
    }
});
const getAllNotification = (filters, paginationOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerms, read } = filters, filterableData = __rest(filters, ["searchTerms", "read"]);
    const andConditions = [];
    if (searchTerms) {
        andConditions.push({
            $or: notification_constants_1.notificationSearchableFields.map((field) => ({
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
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    const sortCondition = {};
    if (sortBy && sortOrder) {
        sortCondition[sortBy] = sortOrder;
    }
    else {
        sortCondition["createdAt"] = "desc";
    }
    const whereCondition = andConditions.length > 0 ? { $and: andConditions } : {};
    const [result, total] = yield Promise.all([
        notification_model_1.Notification.find(whereCondition)
            .sort(sortCondition)
            .skip(skip)
            .limit(limit)
            .lean(),
        notification_model_1.Notification.countDocuments(whereCondition),
    ]);
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const getAllNotificationByUser = (userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield resolveActorByEmail(userEmail);
    const [recentNotifications, unreadCount] = yield Promise.all([
        notification_model_1.Notification.find({ user: user._id })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean(),
        notification_model_1.Notification.countDocuments({ user: user._id, read: false }),
    ]);
    return {
        data: recentNotifications,
        unreadCount,
    };
});
const getUnreadCountByUser = (userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield resolveActorByEmail(userEmail);
    return notification_model_1.Notification.countDocuments({ user: user._id, read: false });
});
const getSingleNotificationById = (id, userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid notification ID");
    }
    const actor = yield resolveActorByEmail(userEmail);
    const result = yield notification_model_1.Notification.findById(id).lean();
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Notification not found");
    }
    assertOwnershipOrAdmin(result, actor);
    return result;
});
const updateNotificationById = (id_1, userEmail_1, ...args_1) => __awaiter(void 0, [id_1, userEmail_1, ...args_1], void 0, function* (id, userEmail, readValue = true) {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid notification ID");
    }
    const actor = yield resolveActorByEmail(userEmail);
    const existingNotification = yield notification_model_1.Notification.findById(id).lean();
    if (!existingNotification) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Notification not found");
    }
    assertOwnershipOrAdmin(existingNotification, actor);
    const result = yield notification_model_1.Notification.findByIdAndUpdate(id, { read: Boolean(readValue) }, {
        new: true,
        runValidators: true,
    }).lean();
    return result;
});
const markAllAsRead = (userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield resolveActorByEmail(userEmail);
    const res = yield notification_model_1.Notification.updateMany({ user: user._id, read: false }, { $set: { read: true } });
    return { modifiedCount: res.modifiedCount || 0 };
});
const deleteNotificationById = (id, userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid notification ID");
    }
    const actor = yield resolveActorByEmail(userEmail);
    const existing = yield notification_model_1.Notification.findById(id).lean();
    if (!existing) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Notification not found");
    }
    assertOwnershipOrAdmin(existing, actor);
    const result = yield notification_model_1.Notification.findByIdAndDelete(id).lean();
    return result;
});
exports.NotificationService = {
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
