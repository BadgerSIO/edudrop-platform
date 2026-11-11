import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { SchoolService } from "./school.services";
import { ISchool } from "./school.interface";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import { schoolFilterableFields } from "./school.constants";
import { SchoolInfo } from "../schoolInfo/schoolInfo.model";
import { cleanupUnsavedTemporaryUpload } from "../../../helper/mediaCleanupHelper";

const uploadImage: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const file =
      req.file ||
      (Array.isArray(req.files) && req.files.length > 0 ? req.files[0] : null);

    if (!file) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "No image file uploaded",
        data: null,
      });
    }

    const imageUrl = `/uploads/school/${file.filename}`;
    const previousTemporaryUrl = req.body?.previousTemporaryUrl;
    if (previousTemporaryUrl && previousTemporaryUrl !== imageUrl) {
      await cleanupUnsavedTemporaryUpload(
        previousTemporaryUrl,
        "school",
        async (url) => {
          const exists = await SchoolInfo.exists({
            $or: [
              { schoolLogo: url },
              { featuredImage: url },
              { heroBackgroundImage: url },
              { sectionOneImage: url },
              { "gallery.imageUrl": url },
            ],
          });
          return Boolean(exists);
        }
      );
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Image uploaded successfully",
      data: {
        imageUrl,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
      },
    });
  }
);

const createSchool: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { bursar, ...schoolinfo } = req.body;
    const { password, ...bursarData } = await bursar;
    const result = await SchoolService.createSchool(schoolinfo, bursarData, {
      password,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "School created successfully",
      data: result,
    });
  }
);

const getAllSchool: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, schoolFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await SchoolService.getAllSchool(filters, paginationOptions);
    sendResponse<ISchool[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Schools retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getSingleSchoolBySlug: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const result = await SchoolService.getSingleSchoolBySlug(slug);
    sendResponse<ISchool>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "School retrieved successfully",
      data: result,
    });
  }
);

const getSchoolStatus: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const email = res.locals.email;
    const result = await SchoolService.getSchoolStatus(email);
    sendResponse<ISchool>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "School status retrieved successfully",
      data: result,
    });
  }
);

const updateSchoolById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const school = req.body;
    const result = await SchoolService.updateSchoolById(id, school);
    sendResponse<ISchool>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "School updated successfully",
      data: result,
    });
  }
);

const updateSchoolStatus: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const adminemail = res.locals.email;
    const result = await SchoolService.updateSchoolStatus(slug, adminemail);
    sendResponse<ISchool>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "School status updated successfully",
      data: result,
    });
  }
);

const deleteSchoolById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await SchoolService.deleteSchoolById(id);
    sendResponse<ISchool>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "School deleted successfully",
      data: result,
    });
  }
);

export const SchoolController = {
  uploadImage,
  createSchool,
  getAllSchool,
  getSingleSchoolBySlug,
  deleteSchoolById,
  updateSchoolById,
  updateSchoolStatus,
  getSchoolStatus,
};
