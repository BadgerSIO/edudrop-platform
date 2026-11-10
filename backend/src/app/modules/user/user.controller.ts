import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { paginationFields } from "../../../constants/pagination";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { userFilterableFields } from "./user.constants";
import { IUser } from "./user.interface";
import { UserService } from "./user.service";

const getAllUsers: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, userFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await UserService.getAllUsers(filters, paginationOptions);

    sendResponse<IUser[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Users retrieved successfully",
      meta: result.meta,
      data: result.data,
      additionalData: result.kpis,
    });
  }
);

const getSingleUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await UserService.getSingleUser(id);

    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User fetched successfully",
      data: result,
    });
  }
);

const updateUserStatus: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const adminEmail = (req as any).user?.email;

    const result = await UserService.updateUserStatus(id, status, adminEmail);

    sendResponse<IUser>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `User status changed to ${status}`,
      data: result,
    });
  }
);

const resetUserPassword: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    const adminEmail = (req as any).user?.email;

    const result = await UserService.resetUserPassword(
      id,
      newPassword,
      adminEmail
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: result.message,
      data: result,
    });
  }
);

const deleteUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminEmail = (req as any).user?.email;

    const result = await UserService.deleteUser(id, adminEmail);

    sendResponse<IUser>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User account archived successfully",
      data: result,
    });
  }
);

export const UserController = {
  getAllUsers,
  getSingleUser,
  updateUserStatus,
  resetUserPassword,
  deleteUser,
};
