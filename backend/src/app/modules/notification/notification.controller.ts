import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { NotificationService } from "./notification.services";
import { INotification } from "./notification.interface";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import { notificationFilterableFields } from "./notification.constants";

const getAllNotification: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, notificationFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await NotificationService.getAllNotification(
      filters,
      paginationOptions
    );
    sendResponse<INotification[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notification retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);
const getAllNotificationByUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const userEmail = await res.locals.email;
    const result = await NotificationService.getAllNotificationByUser(
      userEmail
    );
    sendResponse<INotification[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notification retrieved successfully",
      data: result.data,
    });
  }
);
const getSingleNotificationById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await NotificationService.getSingleNotificationById(id);
    sendResponse<INotification>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notification retrieved successfully",
      data: result,
    });
  }
);
const updateNotificationById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await NotificationService.updateNotificationById(id);
    sendResponse<INotification>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notification updated successfully",
      data: result,
    });
  }
);
const deleteNotificationById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await NotificationService.deleteNotificationById(id);
    sendResponse<INotification>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notification deleted",
      data: result,
    });
  }
);

export const NotificationController = {
  getAllNotification,
  getSingleNotificationById,
  deleteNotificationById,
  updateNotificationById,
  getAllNotificationByUser,
};
