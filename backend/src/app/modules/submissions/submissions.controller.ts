import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { SubmissionsService } from "./submissions.services";
import { ISubmissions } from "./submissions.interface";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import { submissionsFilterableFields } from "./submissions.constants";

const createSubmissions: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const submissions = { ...req.body, seen: false };
    const result = await SubmissionsService.createSubmissions(submissions);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Submissions created successfully",
      data: result,
    });
  }
);

const getAllSubmissions: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, submissionsFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await SubmissionsService.getAllSubmissions(
      filters,
      paginationOptions
    );

    sendResponse<ISubmissions[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Submissions retrieved successfully",
      meta: result.meta,
      data: result.data,
      additionalData: result.kpis,
    });
  }
);

const getSingleSubmissionById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await SubmissionsService.getSingleSubmissionById(id);

    sendResponse<ISubmissions>(res, {
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
    const submissions = req.body;
    const result = await SubmissionsService.updateSubmissionById(
      id,
      submissions
    );

    sendResponse<ISubmissions>(res, {
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
    const result = await SubmissionsService.deleteSubmissionById(id);

    sendResponse<ISubmissions>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Submission archived successfully",
      data: result,
    });
  }
);

const getUnreadCount: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const count = await SubmissionsService.getUnreadCount();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Unread count fetched",
      data: { unreadCount: count },
    });
  }
);

export const SubmissionsController = {
  createSubmissions,
  getAllSubmissions,
  getSingleSubmissionById,
  deleteSubmissionById,
  updateSubmissionById,
  getUnreadCount,
};
