import { HydratedDocument } from "mongoose";
import { ISiteContentCMS, IOurWorkCMS, ITestimonialCMS } from "./cms.interface";
import { SiteContent } from "./cms.model";
import ApiError from "../../../error/ApiError";
import httpStatus from "http-status";
import {
  computeRemovedUrls,
  safeUnlinkUpload,
} from "../../../helper/mediaCleanupHelper";

const extractCmsImageUrls = (
  doc: Partial<ISiteContentCMS> | null | undefined
): string[] => {
  if (!doc) return [];
  const urls: string[] = [];
  if (doc.whyEduDrop?.image) urls.push(doc.whyEduDrop.image);
  if (Array.isArray(doc.ourWorks)) {
    for (const work of doc.ourWorks) {
      if (work?.imageUrl) urls.push(work.imageUrl);
    }
  }
  if (Array.isArray(doc.testimonials)) {
    for (const item of doc.testimonials) {
      if (item?.imageUrl) urls.push(item.imageUrl);
    }
  }
  return urls;
};

const unlinkRemovedCmsImages = async (
  oldUrls: string[],
  nextDoc: Partial<ISiteContentCMS> | null | undefined
) => {
  if (!nextDoc) return;
  const removed = computeRemovedUrls(oldUrls, extractCmsImageUrls(nextDoc));
  await Promise.all(removed.map((url) => safeUnlinkUpload(url, "cms")));
};

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
  const oldUrls = extractCmsImageUrls(existing);

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

  if (updated) {
    await unlinkRemovedCmsImages(oldUrls, updated);
  }
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
  const oldUrls = extractCmsImageUrls(content);
  Object.assign(workItem, updatedWork);
  await content.save();
  await unlinkRemovedCmsImages(oldUrls, content);
  return content;
};

const deleteOurWork = async (id: string): Promise<ISiteContentCMS | null> => {
  const content = await getSiteContentDoc();
  const oldUrls = extractCmsImageUrls(content);
  content.ourWorks = content.ourWorks.filter((w: any) => String(w._id) !== id);
  await content.save();
  await unlinkRemovedCmsImages(oldUrls, content);
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
  const oldUrls = extractCmsImageUrls(content);
  Object.assign(item, updatedTestimonial);
  await content.save();
  await unlinkRemovedCmsImages(oldUrls, content);
  return content;
};

const deleteTestimonial = async (id: string): Promise<ISiteContentCMS | null> => {
  const content = await getSiteContentDoc();
  const oldUrls = extractCmsImageUrls(content);
  content.testimonials = content.testimonials.filter(
    (t: any) => String(t._id) !== id
  );
  await content.save();
  await unlinkRemovedCmsImages(oldUrls, content);
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
