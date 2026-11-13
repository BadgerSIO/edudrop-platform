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
exports.NotificationController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const pagination_1 = require("../../../constants/pagination");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const pick_1 = __importDefault(require("../../../shared/pick"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const notification_constants_1 = require("./notification.constants");
const notification_services_1 = require("./notification.services");
const getAllNotification = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, notification_constants_1.notificationFilterableFields);
    const paginationOptions = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = yield notification_services_1.NotificationService.getAllNotification(filters, paginationOptions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Notifications retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
}));
const getAllNotificationByUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userEmail = res.locals.email || ((_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.email);
    const result = yield notification_services_1.NotificationService.getAllNotificationByUser(userEmail);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Notifications retrieved successfully",
        data: result.data,
        additionalData: {
            unreadCount: result.unreadCount,
        },
    });
}));
const getUnreadCountByUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userEmail = res.locals.email || ((_b = res.locals.user) === null || _b === void 0 ? void 0 : _b.email);
    const unreadCount = yield notification_services_1.NotificationService.getUnreadCountByUser(userEmail);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Unread count retrieved",
        data: { unreadCount },
    });
}));
const getSingleNotificationById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const id = req.params.id;
    const userEmail = res.locals.email || ((_c = res.locals.user) === null || _c === void 0 ? void 0 : _c.email);
    const result = yield notification_services_1.NotificationService.getSingleNotificationById(id, userEmail);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Notification retrieved successfully",
        data: result,
    });
}));
const updateNotificationById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    const id = req.params.id;
    const userEmail = res.locals.email || ((_d = res.locals.user) === null || _d === void 0 ? void 0 : _d.email);
    const readValue = typeof ((_e = req.body) === null || _e === void 0 ? void 0 : _e.read) === "boolean" ? req.body.read : true;
    const result = yield notification_services_1.NotificationService.updateNotificationById(id, userEmail, readValue);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Notification updated successfully",
        data: result,
    });
}));
const markAllAsRead = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const userEmail = res.locals.email || ((_f = res.locals.user) === null || _f === void 0 ? void 0 : _f.email);
    const result = yield notification_services_1.NotificationService.markAllAsRead(userEmail);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "All notifications marked as read",
        data: result,
    });
}));
const deleteNotificationById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    const id = req.params.id;
    const userEmail = res.locals.email || ((_g = res.locals.user) === null || _g === void 0 ? void 0 : _g.email);
    const result = yield notification_services_1.NotificationService.deleteNotificationById(id, userEmail);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Notification dismissed",
        data: result,
    });
}));
exports.NotificationController = {
    getAllNotification,
    getSingleNotificationById,
    deleteNotificationById,
    updateNotificationById,
    getAllNotificationByUser,
    getUnreadCountByUser,
    markAllAsRead,
};
