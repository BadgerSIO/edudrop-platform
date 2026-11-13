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
exports.SchoolInboxController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const schoolInbox_services_1 = require("./schoolInbox.services");
const pick_1 = __importDefault(require("../../../shared/pick"));
const pagination_1 = require("../../../constants/pagination");
const schoolInbox_constants_1 = require("./schoolInbox.constants");
const createSchoolInbox = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schoolInbox = Object.assign(Object.assign({}, req.body), { seen: false });
    const result = yield schoolInbox_services_1.SchoolInboxService.createSchoolInbox(schoolInbox);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "SchoolInbox created successfully",
        data: result,
    });
}));
const getAllSchoolInbox = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const email = res.locals.email || ((_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.email);
    const filters = (0, pick_1.default)(req.query, schoolInbox_constants_1.schoolInboxFilterableFields);
    const paginationOptions = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = yield schoolInbox_services_1.SchoolInboxService.getAllSchoolInbox(filters, paginationOptions, email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "SchoolInbox retrieved successfully",
        meta: result.meta,
        data: result.data,
        additionalData: result.kpis,
    });
}));
const getSingleSubmissionById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const id = req.params.id;
    const email = res.locals.email || ((_b = res.locals.user) === null || _b === void 0 ? void 0 : _b.email);
    const result = yield schoolInbox_services_1.SchoolInboxService.getSingleSubmissionById(id, email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Submission retrieved successfully",
        data: result,
    });
}));
const updateSubmissionById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const id = req.params.id;
    const email = res.locals.email || ((_c = res.locals.user) === null || _c === void 0 ? void 0 : _c.email);
    const schoolInbox = req.body;
    const result = yield schoolInbox_services_1.SchoolInboxService.updateSubmissionById(id, schoolInbox, email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Submission updated successfully",
        data: result,
    });
}));
const deleteSubmissionById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const id = req.params.id;
    const email = res.locals.email || ((_d = res.locals.user) === null || _d === void 0 ? void 0 : _d.email);
    const result = yield schoolInbox_services_1.SchoolInboxService.deleteSubmissionById(id, email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Submission archived successfully",
        data: result,
    });
}));
const getUnreadCount = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const email = res.locals.email || ((_e = res.locals.user) === null || _e === void 0 ? void 0 : _e.email);
    const count = yield schoolInbox_services_1.SchoolInboxService.getUnreadCount(email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Unread count fetched",
        data: { unreadCount: count },
    });
}));
exports.SchoolInboxController = {
    createSchoolInbox,
    getAllSchoolInbox,
    getSingleSubmissionById,
    deleteSubmissionById,
    updateSubmissionById,
    getUnreadCount,
};
