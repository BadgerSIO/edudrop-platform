import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { SchoolInboxService } from "./schoolInbox.services";
import { ISchoolInbox } from "./schoolInbox.interface";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import { schoolInboxFilterableFields } from "./schoolInbox.constants";

const createSchoolInbox: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const schoolInbox = { ...req.body, seen: false };
    const result = await SchoolInboxService.createSchoolInbox(schoolInbox);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "SchoolInbox created successfully",
      data: result,
    });
  }
);

const getAllSchoolInbox: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const email = res.locals.email || res.locals.user?.email;
    const filters = pick(req.query, schoolInboxFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await SchoolInboxService.getAllSchoolInbox(
      filters,
      paginationOptions,
      email
    );

    sendResponse<ISchoolInbox[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "SchoolInbox retrieved successfully",
      meta: result.meta,
      data: result.data,
      additionalData: result.kpis,
    });
  }
);

const getSingleSubmissionById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const email = res.locals.email || res.locals.user?.email;

    const result = await SchoolInboxService.getSingleSubmissionById(id, email);

    sendResponse<ISchoolInbox>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Submission retrieved successfully",
      data: result,
    });
  }
);

const updateSubmissionById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const email = res.locals.email || res.locals.user?.email;
    const schoolInbox = req.body;

    const result = await SchoolInboxService.updateSubmissionById(
      id,
      schoolInbox,
      email
    );

    sendResponse<ISchoolInbox>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Submission updated successfully",
      data: result,
    });
  }
);

const deleteSubmissionById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const email = res.locals.email || res.locals.user?.email;

    const result = await SchoolInboxService.deleteSubmissionById(id, email);

    sendResponse<ISchoolInbox>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Submission archived successfully",
      data: result,
    });
  }
);

const getUnreadCount: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const email = res.locals.email || res.locals.user?.email;
    const count = await SchoolInboxService.getUnreadCount(email);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Unread count fetched",
      data: { unreadCount: count },
    });
  }
);

export const SchoolInboxController = {
  createSchoolInbox,
  getAllSchoolInbox,
  getSingleSubmissionById,
  deleteSubmissionById,
  updateSubmissionById,
  getUnreadCount,
};
