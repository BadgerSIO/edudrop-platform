import { HydratedDocument } from "mongoose";
import { ISiteContentCMS, IOurWorkCMS, ITestimonialCMS } from "./cms.interface";
import { SiteContent } from "./cms.model";
import ApiError from "../../../error/ApiError";
import httpStatus from "http-status";

const getSiteContentDoc = async (): Promise<HydratedDocument<ISiteContentCMS>> => {
  let content = await SiteContent.findOne({ slug: "global" });
  if (!content) {
    content = await SiteContent.create({ slug: "global" });
  }
  return content;
};

const getSiteContent = async (): Promise<ISiteContentCMS> => {
  return await getSiteContentDoc();
};

const updateSiteContent = async (
  payload: Partial<ISiteContentCMS>
): Promise<ISiteContentCMS | null> => {
  const existing = await getSiteContentDoc();

  const updateData: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) {
      updateData[key] = value;
    }
  }

  const updated = await SiteContent.findByIdAndUpdate(
    existing._id,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  return updated;
};

// Our Works CRUD
const addOurWork = async (item: IOurWorkCMS): Promise<ISiteContentCMS | null> => {
  const content = await getSiteContentDoc();
  content.ourWorks.push(item);
  await content.save();
  return content;
};

const updateOurWork = async (
  id: string,
  updatedWork: Partial<IOurWorkCMS>
): Promise<ISiteContentCMS | null> => {
  const content = await getSiteContentDoc();
  const workItem = (content.ourWorks as any).id(id);
  if (!workItem) {
    throw new ApiError(httpStatus.NOT_FOUND, "Work showcase not found");
  }
  Object.assign(workItem, updatedWork);
  await content.save();
  return content;
};

const deleteOurWork = async (id: string): Promise<ISiteContentCMS | null> => {
  const content = await getSiteContentDoc();
  content.ourWorks = content.ourWorks.filter((w: any) => String(w._id) !== id);
  await content.save();
  return content;
};

// Testimonials CRUD
const addTestimonial = async (
  item: ITestimonialCMS
): Promise<ISiteContentCMS | null> => {
  const content = await getSiteContentDoc();
  content.testimonials.push(item);
  await content.save();
  return content;
};

const updateTestimonial = async (
  id: string,
  updatedTestimonial: Partial<ITestimonialCMS>
): Promise<ISiteContentCMS | null> => {
  const content = await getSiteContentDoc();
  const item = (content.testimonials as any).id(id);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, "Testimonial not found");
  }
  Object.assign(item, updatedTestimonial);
  await content.save();
  return content;
};

const deleteTestimonial = async (id: string): Promise<ISiteContentCMS | null> => {
  const content = await getSiteContentDoc();
  content.testimonials = content.testimonials.filter(
    (t: any) => String(t._id) !== id
  );
  await content.save();
  return content;
};

export const CMSService = {
  getSiteContent,
  updateSiteContent,
  addOurWork,
  updateOurWork,
  deleteOurWork,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
