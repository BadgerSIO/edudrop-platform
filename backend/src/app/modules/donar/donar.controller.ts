import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { paginationFields } from "../../../constants/pagination";
import ApiError from "../../../error/ApiError";
import {
  cleanupUploadedFile,
  parseAndValidateProfileBody,
} from "../../../helper/profileUpdateHelper";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { donarFilterableFields } from "./donar.constants";
import { IDonar } from "./donar.interface";
import { DonarService } from "./donar.service";
import { DonarValidation } from "./donar.validation";

const executeDonarUpdate = async (
  id: string,
  req: Request,
  res: Response
) => {
  const validatedData = await parseAndValidateProfileBody<
    Partial<IDonar> & { removeProfileImage?: boolean | string }
  >(DonarValidation.updateDonarZodSchema, req.body, req.file);

  const newProfileImagePath = req.file
    ? `/uploads/users/${req.file.filename}`
    : undefined;

  try {
    const result = await DonarService.updateDonar(
      id,
      validatedData,
      newProfileImagePath
    );

    sendResponse<IDonar>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Donor profile updated successfully!",
      data: result,
    });
  } catch (error) {
    await cleanupUploadedFile(req.file);
    throw error;
  }
};

const getAllDonar: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, donarFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await DonarService.getAllDonar(filters, paginationOptions);
    sendResponse<IDonar[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Donars retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const donarId = res.locals.user?.donar;
  if (!donarId) {
    throw new ApiError(httpStatus.NOT_FOUND, "Donor profile not linked to user");
  }

  const result = await DonarService.getSingleDonar(String(donarId));
  sendResponse<IDonar>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donor profile fetched successfully!",
    data: result,
  });
});

const getSingleDonar = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await DonarService.getSingleDonar(id);

  sendResponse<IDonar>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donar fetched successfully!",
    data: result,
  });
});

const deleteDonar = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await DonarService.deleteDonar(id);

  sendResponse<IDonar>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donar deleted successfully!",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const donarId = res.locals.user?.donar;
  if (!donarId) {
    await cleanupUploadedFile(req.file);
    throw new ApiError(httpStatus.NOT_FOUND, "Donor profile not linked to user");
  }
  await executeDonarUpdate(String(donarId), req, res);
});

const updateDonar = catchAsync(async (req: Request, res: Response) => {
  await executeDonarUpdate(req.params.id, req, res);
});

const updateDonarStatus: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const adminemail = res.locals.email;
    const result = await DonarService.updateDonarStatus(id, adminemail);
    sendResponse<IDonar>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Donar updated successfully",
      data: result,
    });
  }
);

export const DonarController = {
  getAllDonar,
  getMyProfile,
  getSingleDonar,
  deleteDonar,
  updateMyProfile,
  updateDonar,
  updateDonarStatus,
};
