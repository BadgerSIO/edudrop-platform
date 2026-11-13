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
exports.SubmissionsService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../error/ApiError"));
const paginationHelper_1 = require("../../../helper/paginationHelper");
const submissions_constants_1 = require("./submissions.constants");
const submissions_model_1 = require("./submissions.model");
const nodemailer_1 = require("../../../config/nodemailer");
const user_model_1 = require("../user/user.model");
const emailTemplate_1 = __importDefault(require("../../../shared/emailTemplate"));
const notification_services_1 = require("../notification/notification.services");
const createSubmissions = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const submissionData = {
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
    let adminUser = null;
    // Non-blocking try-catch for admin SMTP notification
    try {
        adminUser = yield user_model_1.User.findOne({ role: "admin" }, { _id: 1, email: 1 }).lean();
        if (adminUser) {
            const topicTag = submissionData.topic ? ` [${submissionData.topic}]` : "";
            const info = yield nodemailer_1.transport.sendMail({
                from: `"EduDrop Platform Inquiry" <${submissionData.email}>`,
                to: adminUser.email,
                subject: `Platform Inquiry${topicTag} from ${submissionData.firstName} ${submissionData.lastName}`,
                text: submissionData.message,
                html: (0, emailTemplate_1.default)("contactForm", submissionData),
            });
            submissionData.messageId = info.messageId;
        }
    }
    catch (error) {
        console.error("Failed to dispatch admin inquiry email:", error);
    }
    const result = yield submissions_model_1.Submissions.create(submissionData);
    if (result && (adminUser === null || adminUser === void 0 ? void 0 : adminUser._id)) {
        const senderName = `${submissionData.firstName} ${submissionData.lastName}`.trim() || submissionData.email;
        const topicPrefix = submissionData.topic ? `[${submissionData.topic}] ` : "";
        notification_services_1.NotificationService.createNotificationSafe({
            user: adminUser._id,
            message: `${topicPrefix}New inquiry from ${senderName}`,
            link: `/dashboard/form-submissions/${result._id}`,
            read: false,
        }).catch(console.error);
    }
    return result;
});
const getAllSubmissions = (filters, paginationOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm, searchTerms, status, seen, isDeleted } = filters, filterableData = __rest(filters, ["searchTerm", "searchTerms", "status", "seen", "isDeleted"]);
    const term = (searchTerm || searchTerms || "").trim();
    const andConditions = [];
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
            $or: submissions_constants_1.submissionsSearchableFields.map((field) => ({
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
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    const sortCondition = {};
    if (sortBy && sortOrder) {
        sortCondition[sortBy] = sortOrder;
    }
    else {
        sortCondition["createdAt"] = "desc";
    }
    const whereCondition = andConditions.length > 0 ? { $and: andConditions } : {};
    const [result, total, unreadCount, repliedCount] = yield Promise.all([
        submissions_model_1.Submissions.find(whereCondition)
            .sort(sortCondition)
            .skip(skip)
            .limit(limit)
            .lean(),
        submissions_model_1.Submissions.countDocuments(whereCondition),
        submissions_model_1.Submissions.countDocuments({ seen: false, isDeleted: { $ne: true } }),
        submissions_model_1.Submissions.countDocuments({ status: "replied", isDeleted: { $ne: true } }),
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
const getSingleSubmissionById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield submissions_model_1.Submissions.findOne({
        _id: id,
        isDeleted: { $ne: true },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Submission message not found");
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
const updateSubmissionById = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield submissions_model_1.Submissions.findById(id);
    if (!existing) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Submission message not found");
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
    const result = yield submissions_model_1.Submissions.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
const deleteSubmissionById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Soft delete preserving audit record
    const result = yield submissions_model_1.Submissions.findByIdAndUpdate(id, { isDeleted: true, status: "archived" }, { new: true });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Submission message not found");
    }
    return result;
});
const getUnreadCount = () => __awaiter(void 0, void 0, void 0, function* () {
    const count = yield submissions_model_1.Submissions.countDocuments({
        seen: false,
        isDeleted: { $ne: true },
    });
    return count;
});
exports.SubmissionsService = {
    createSubmissions,
    getAllSubmissions,
    getSingleSubmissionById,
    deleteSubmissionById,
    updateSubmissionById,
    getUnreadCount,
};
