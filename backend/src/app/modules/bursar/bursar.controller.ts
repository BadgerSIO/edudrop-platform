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
import { bursarFilterableFields } from "./bursar.constants";
import { IBursar } from "./bursar.interface";
import { BursarService } from "./bursar.service";
import { BursarValidation } from "./bursar.validation";

const executeBursarUpdate = async (
  id: string,
  req: Request,
  res: Response
) => {
  const validatedData = await parseAndValidateProfileBody<
    Partial<IBursar> & { removeProfileImage?: boolean | string }
  >(BursarValidation.updateBursarZodSchema, req.body, req.file);

  const newProfileImagePath = req.file
    ? `/uploads/users/${req.file.filename}`
    : undefined;

  try {
    const result = await BursarService.updateBursar(
      id,
      validatedData,
      newProfileImagePath
    );

    sendResponse<IBursar>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Bursar profile updated successfully!",
      data: result,
    });
  } catch (error) {
    await cleanupUploadedFile(req.file);
    throw error;
  }
};

const getAllBursar: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, bursarFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await BursarService.getAllBursar(filters, paginationOptions);
    sendResponse<IBursar[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Bursars retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const bursarId = res.locals.user?.bursar;
  if (!bursarId) {
    throw new ApiError(httpStatus.NOT_FOUND, "Bursar profile not linked to user");
  }

  const result = await BursarService.getSingleBursar(String(bursarId));
  sendResponse<IBursar>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bursar profile fetched successfully!",
    data: result,
  });
});

const getSingleBursar = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await BursarService.getSingleBursar(id);

  sendResponse<IBursar>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bursar fetched successfully!",
    data: result,
  });
});

const deleteBursar = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await BursarService.deleteBursar(id);

  sendResponse<IBursar>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bursar deleted successfully!",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const bursarId = res.locals.user?.bursar;
  if (!bursarId) {
    await cleanupUploadedFile(req.file);
    throw new ApiError(httpStatus.NOT_FOUND, "Bursar profile not linked to user");
  }
  await executeBursarUpdate(String(bursarId), req, res);
});

const updateBursar = catchAsync(async (req: Request, res: Response) => {
  await executeBursarUpdate(req.params.id, req, res);
});

export const BursarController = {
  getAllBursar,
  getMyProfile,
  getSingleBursar,
  deleteBursar,
  updateMyProfile,
  updateBursar,
};
