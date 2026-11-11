import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { paginationFields } from "../../../constants/pagination";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { notificationFilterableFields } from "./notification.constants";
import { INotification } from "./notification.interface";
import { NotificationService } from "./notification.services";

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
      message: "Notifications retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getAllNotificationByUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const userEmail = res.locals.email || res.locals.user?.email;
    const result = await NotificationService.getAllNotificationByUser(
      userEmail
    );
    sendResponse<INotification[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notifications retrieved successfully",
      data: result.data,
      additionalData: {
        unreadCount: result.unreadCount,
      },
    });
  }
);

const getUnreadCountByUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const userEmail = res.locals.email || res.locals.user?.email;
    const unreadCount = await NotificationService.getUnreadCountByUser(
      userEmail
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Unread count retrieved",
      data: { unreadCount },
    });
  }
);

const getSingleNotificationById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const userEmail = res.locals.email || res.locals.user?.email;
    const result = await NotificationService.getSingleNotificationById(
      id,
      userEmail
    );
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
    const userEmail = res.locals.email || res.locals.user?.email;
    const readValue =
      typeof req.body?.read === "boolean" ? req.body.read : true;
    const result = await NotificationService.updateNotificationById(
      id,
      userEmail,
      readValue
    );
    sendResponse<INotification>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notification updated successfully",
      data: result,
    });
  }
);

const markAllAsRead: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const userEmail = res.locals.email || res.locals.user?.email;
    const result = await NotificationService.markAllAsRead(userEmail);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All notifications marked as read",
      data: result,
    });
  }
);

const deleteNotificationById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const userEmail = res.locals.email || res.locals.user?.email;
    const result = await NotificationService.deleteNotificationById(
      id,
      userEmail
    );
    sendResponse<INotification>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notification dismissed",
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
  getUnreadCountByUser,
  markAllAsRead,
};
