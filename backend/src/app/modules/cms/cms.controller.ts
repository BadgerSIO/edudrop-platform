import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { CMSService } from "./cms.service";
import { SiteContent } from "./cms.model";
import { cleanupUnsavedTemporaryUpload } from "../../../helper/mediaCleanupHelper";

const getSiteContent: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CMSService.getSiteContent();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Site content retrieved successfully",
      data: result,
    });
  }
);

const updateSiteContent: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await CMSService.updateSiteContent(payload);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Site content updated successfully",
      data: result,
    });
  }
);

const uploadMedia: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ success: false, message: "No file uploaded" });
    }
    const fileUrl = `/uploads/cms/${file.filename}`;
    const previousTemporaryUrl = req.body?.previousTemporaryUrl;
    if (previousTemporaryUrl && previousTemporaryUrl !== fileUrl) {
      await cleanupUnsavedTemporaryUpload(
        previousTemporaryUrl,
        "cms",
        async (url) => {
          const exists = await SiteContent.exists({
            $or: [
              { "whyEduDrop.image": url },
              { "ourWorks.imageUrl": url },
              { "testimonials.imageUrl": url },
            ],
          });
          return Boolean(exists);
        }
      );
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "File uploaded successfully",
      data: {
        url: fileUrl,
        imageUrl: fileUrl,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
      },
    });
  }
);

// Works
const addOurWork: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await CMSService.addOurWork(payload);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Work item added successfully",
      data: result,
    });
  }
);

const updateOurWork: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const payload = req.body;
    const result = await CMSService.updateOurWork(id, payload);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Work item updated successfully",
      data: result,
    });
  }
);

const deleteOurWork: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await CMSService.deleteOurWork(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Work item deleted successfully",
      data: result,
    });
  }
);

// Testimonials
const addTestimonial: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await CMSService.addTestimonial(payload);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Testimonial added successfully",
      data: result,
    });
  }
);

const updateTestimonial: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const payload = req.body;
    const result = await CMSService.updateTestimonial(id, payload);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Testimonial updated successfully",
      data: result,
    });
  }
);

const deleteTestimonial: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await CMSService.deleteTestimonial(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Testimonial deleted successfully",
      data: result,
    });
  }
);

export const CMSController = {
  getSiteContent,
  updateSiteContent,
  uploadMedia,
  addOurWork,
  updateOurWork,
  deleteOurWork,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
