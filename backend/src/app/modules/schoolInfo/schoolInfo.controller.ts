import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ISchoolInfo } from "./schoolInfo.interface";
import httpStatus from "http-status";
import { SchoolInfoService } from "./schoolInfo.service";

const updateSchoolInfoById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const schoolInfo = req.body;
    const currentUser = res.locals.user;

    if (Array.isArray(req.files)) {
      req.files.forEach((file: Express.Multer.File) => {
        if (
          file.fieldname &&
          file.fieldname.startsWith("gallery") &&
          file.filename
        ) {
          const indexMatch = file.fieldname.match(/\d+/);
          const index = indexMatch ? Number(indexMatch[0]) : -1;

          if (index >= 0) {
            schoolInfo.gallery = schoolInfo.gallery || [];
            schoolInfo.gallery[index] = {
              ...(schoolInfo.gallery[index] || {}),
              imageUrl: `/uploads/school/${file.filename}`,
            };
          }
        } else if (file.fieldname === "schoolLogo" && file.filename) {
          schoolInfo.schoolLogo = `/uploads/school/${file.filename}`;
        } else if (file.fieldname === "featuredImage" && file.filename) {
          schoolInfo.featuredImage = `/uploads/school/${file.filename}`;
        } else if (file.fieldname === "heroBackgroundImage" && file.filename) {
          schoolInfo.heroBackgroundImage = `/uploads/school/${file.filename}`;
        } else if (file.fieldname === "sectionOneImage" && file.filename) {
          schoolInfo.sectionOneImage = `/uploads/school/${file.filename}`;
        }
      });
    }

    const result = await SchoolInfoService.updateSchoolInfoById(
      id,
      schoolInfo,
      currentUser
    );

    sendResponse<ISchoolInfo>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "School info updated successfully",
      data: result,
    });
  }
);

const getSingleSchoolInfoById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const email = res.locals.email;
    const result = await SchoolInfoService.getSingleSchoolInfoById(email);
    sendResponse<ISchoolInfo>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "School retrieved successfully",
      data: result,
    });
  }
);

const getSingleSchoolInfoBySlug: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const result = await SchoolInfoService.getSingleSchoolInfoBySlug(slug);
    sendResponse<ISchoolInfo>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "School retrieved successfully",
      data: result,
    });
  }
);

const getSingleSchoolInfoBySlugOptimized: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const result = await SchoolInfoService.getSingleSchoolInfoBySlugOptimized(slug);
    sendResponse<ISchoolInfo>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "School retrieved successfully",
      data: result,
    });
  }
);

const getAllSchool: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SchoolInfoService.getAllSchool();
    sendResponse<ISchoolInfo[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Schools retrieved successfully",
      data: result.data,
    });
  }
);

export const SchoolInfoController = {
  updateSchoolInfoById,
  getSingleSchoolInfoById,
  getSingleSchoolInfoBySlug,
  getAllSchool,
  getSingleSchoolInfoBySlugOptimized,
};
