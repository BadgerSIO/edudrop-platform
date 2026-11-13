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
exports.SubmissionsController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const submissions_services_1 = require("./submissions.services");
const pick_1 = __importDefault(require("../../../shared/pick"));
const pagination_1 = require("../../../constants/pagination");
const submissions_constants_1 = require("./submissions.constants");
const createSubmissions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const submissions = Object.assign(Object.assign({}, req.body), { seen: false });
    const result = yield submissions_services_1.SubmissionsService.createSubmissions(submissions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Submissions created successfully",
        data: result,
    });
}));
const getAllSubmissions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, submissions_constants_1.submissionsFilterableFields);
    const paginationOptions = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = yield submissions_services_1.SubmissionsService.getAllSubmissions(filters, paginationOptions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Submissions retrieved successfully",
        meta: result.meta,
        data: result.data,
        additionalData: result.kpis,
    });
}));
const getSingleSubmissionById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield submissions_services_1.SubmissionsService.getSingleSubmissionById(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Submission retrieved successfully",
        data: result,
    });
}));
const updateSubmissionById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const submissions = req.body;
    const result = yield submissions_services_1.SubmissionsService.updateSubmissionById(id, submissions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Submission updated successfully",
        data: result,
    });
}));
const deleteSubmissionById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield submissions_services_1.SubmissionsService.deleteSubmissionById(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Submission archived successfully",
        data: result,
    });
}));
const getUnreadCount = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const count = yield submissions_services_1.SubmissionsService.getUnreadCount();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Unread count fetched",
        data: { unreadCount: count },
    });
}));
exports.SubmissionsController = {
    createSubmissions,
    getAllSubmissions,
    getSingleSubmissionById,
    deleteSubmissionById,
    updateSubmissionById,
    getUnreadCount,
};
