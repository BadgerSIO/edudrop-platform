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
exports.SchoolInboxService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const paginationHelper_1 = require("../../../helper/paginationHelper");
const schoolInbox_constants_1 = require("./schoolInbox.constants");
const schoolInbox_model_1 = require("./schoolInbox.model");
const bursar_model_1 = require("../bursar/bursar.model");
const user_model_1 = require("../user/user.model");
const notification_model_1 = require("../notification/notification.model");
const nodemailer_1 = require("../../../config/nodemailer");
const emailTemplate_1 = __importDefault(require("../../../shared/emailTemplate"));
const ApiError_1 = __importDefault(require("../../../error/ApiError"));
const createSchoolInbox = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const rawBursarId = (payload === null || payload === void 0 ? void 0 : payload.bursar) ? String(payload.bursar) : "";
    if (!rawBursarId || !mongoose_1.default.Types.ObjectId.isValid(rawBursarId)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Valid target school bursar ID is required");
    }
    const findBursar = yield bursar_model_1.Bursar.findById(rawBursarId)
        .select({
        _id: 1,
        email: 1,
    })
        .lean();
    if (!findBursar) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Target school bursar not found");
    }
    const inboxData = {
        bursar: findBursar._id,
        firstName: String(payload.firstName || "").trim(),
        lastName: String(payload.lastName || "").trim(),
        email: String(payload.email || "").trim(),
        phone: payload.phone ? String(payload.phone).trim() : undefined,
        message: String(payload.message || "").trim(),
        seen: false,
        status: "unread",
        isDeleted: false,
    };
    // Non-blocking try-catch for SMTP notification
    try {
        const info = yield nodemailer_1.transport.sendMail({
            from: `"From ${inboxData.firstName}" <${inboxData.email}>`,
            to: findBursar.email,
            subject: `Campus Inquiry from ${inboxData.firstName} ${inboxData.lastName}`,
            text: inboxData.message,
            html: (0, emailTemplate_1.default)("contactForm", inboxData),
        });
        inboxData.messageId = info.messageId;
    }
    catch (error) {
        console.error("Failed to dispatch bursar inquiry email:", error);
    }
    const result = yield schoolInbox_model_1.SchoolInbox.create(inboxData);
    if (result) {
        user_model_1.User.findOne({ bursar: findBursar._id }, { _id: 1 })
            .lean()
            .then((bursarUser) => {
            if (bursarUser === null || bursarUser === void 0 ? void 0 : bursarUser._id) {
                notification_model_1.Notification.create({
                    user: bursarUser._id,
                    message: `New campus inquiry from ${inboxData.firstName} ${inboxData.lastName}`,
                    link: `/bursar-dashboard/inbox/${result._id}`,
                    read: false,
                }).catch(console.error);
            }
        })
            .catch(console.error);
    }
    return result;
});
const getAllSchoolInbox = (filters, paginationOptions, email) => __awaiter(void 0, void 0, void 0, function* () {
    const schoolBursar = yield bursar_model_1.Bursar.findOne({ email }, { _id: 1 }).lean();
    if (!schoolBursar) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized bursar access");
    }
    const bursarId = schoolBursar._id;
    const { searchTerm, searchTerms, status, seen, isDeleted } = filters, filterableData = __rest(filters, ["searchTerm", "searchTerms", "status", "seen", "isDeleted"]);
    const term = (searchTerm || searchTerms || "").trim();
    // STRICT MULTITENANCY ENFORCEMENT:
    // Must always filter by the logged-in bursar's ID and exclude deleted items
    const andConditions = [{ bursar: bursarId }];
    if (isDeleted === "true" || isDeleted === true) {
        andConditions.push({ isDeleted: true });
    }
    else {
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
            $or: schoolInbox_constants_1.schoolInboxSearchableFields.map((field) => ({
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
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    const sortCondition = {};
    if (sortBy && sortOrder) {
        sortCondition[sortBy] = sortOrder;
    }
    else {
        sortCondition["createdAt"] = "desc";
    }
    const whereCondition = { $and: andConditions };
    const [result, total, unreadCount, repliedCount] = yield Promise.all([
        schoolInbox_model_1.SchoolInbox.find(whereCondition)
            .sort(sortCondition)
            .skip(skip)
            .limit(limit)
            .lean(),
        schoolInbox_model_1.SchoolInbox.countDocuments(whereCondition),
        schoolInbox_model_1.SchoolInbox.countDocuments({
            bursar: bursarId,
            seen: false,
            isDeleted: { $ne: true },
        }),
        schoolInbox_model_1.SchoolInbox.countDocuments({
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
        data: result,
    };
});
const getSingleSubmissionById = (id, email) => __awaiter(void 0, void 0, void 0, function* () {
    const schoolBursar = yield bursar_model_1.Bursar.findOne({ email }, { _id: 1 }).lean();
    if (!schoolBursar) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized bursar access");
    }
    const result = yield schoolInbox_model_1.SchoolInbox.findOne({
        _id: id,
        bursar: schoolBursar._id,
        isDeleted: { $ne: true },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Inquiry message not found");
    }
    // Automatically mark as seen/read on initial open
    if (!result.seen) {
        result.seen = true;
        if (result.status === "unread") {
            result.status = "read";
        }
        yield result.save();
    }
    return result;
});
const updateSubmissionById = (id, payload, email) => __awaiter(void 0, void 0, void 0, function* () {
    const schoolBursar = yield bursar_model_1.Bursar.findOne({ email }, { _id: 1 }).lean();
    if (!schoolBursar) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized bursar access");
    }
    const existing = yield schoolInbox_model_1.SchoolInbox.findOne({
        _id: id,
        bursar: schoolBursar._id,
    });
    if (!existing) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Inquiry message not found");
    }
    // Synchronize status and seen flags
    if (payload.seen !== undefined) {
        if (payload.seen === true && (!payload.status || payload.status === "unread")) {
            payload.status = "read";
        }
        else if (payload.seen === false) {
            payload.status = "unread";
        }
    }
    if (payload.status === "read" || payload.status === "replied") {
        payload.seen = true;
    }
    else if (payload.status === "unread") {
        payload.seen = false;
    }
    const result = yield schoolInbox_model_1.SchoolInbox.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
const deleteSubmissionById = (id, email) => __awaiter(void 0, void 0, void 0, function* () {
    const schoolBursar = yield bursar_model_1.Bursar.findOne({ email }, { _id: 1 }).lean();
    if (!schoolBursar) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized bursar access");
    }
    // Soft delete preserving audit record
    const result = yield schoolInbox_model_1.SchoolInbox.findOneAndUpdate({ _id: id, bursar: schoolBursar._id }, { isDeleted: true, status: "archived" }, { new: true });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Inquiry message not found");
    }
    return result;
});
const getUnreadCount = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const schoolBursar = yield bursar_model_1.Bursar.findOne({ email }, { _id: 1 }).lean();
    if (!schoolBursar) {
        return 0;
    }
    const count = yield schoolInbox_model_1.SchoolInbox.countDocuments({
        bursar: schoolBursar._id,
        seen: false,
        isDeleted: { $ne: true },
    });
    return count;
});
exports.SchoolInboxService = {
    createSchoolInbox,
    getAllSchoolInbox,
    getSingleSubmissionById,
    deleteSubmissionById,
    updateSubmissionById,
    getUnreadCount,
};
