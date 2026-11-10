import { Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../error/ApiError";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { IAdmin } from "./admin.interface";
import { AdminService } from "./admin.service";

const getCounts = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getCounts();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Counts fetched successfully !",
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const adminId = res.locals.user?.admin;
  if (!adminId) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin profile not linked to user");
  }

  const result = await AdminService.getSingleAdmin(String(adminId));
  sendResponse<IAdmin>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin profile fetched successfully !",
    data: result,
  });
});

const getSingleAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await AdminService.getSingleAdmin(id);

  sendResponse<IAdmin>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin fetched successfully !",
    data: result,
  });
});

const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await AdminService.deleteAdmin(id);

  sendResponse<IAdmin>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin deleted successfully !",
    data: result,
  });
});

export const AdminController = {
  getMyProfile,
  getSingleAdmin,
  deleteAdmin,
  getCounts,
};
