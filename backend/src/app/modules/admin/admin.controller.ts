import { Request, Response } from "express";
import httpStatus from "http-status";
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
const updateAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const updatedData = req.body;

  const result = await AdminService.updateAdmin(id, updatedData);

  sendResponse<IAdmin>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin updated successfully !",
    data: result,
  });
});

export const AdminController = {
  getSingleAdmin,
  deleteAdmin,
  updateAdmin,
  getCounts,
};
