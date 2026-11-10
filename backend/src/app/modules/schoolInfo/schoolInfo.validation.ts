import { z } from "zod";

const CampusNeedSchema = z.object({
  itemTitle: z.string({ required_error: "Item title is required" }),
  productSlug: z.string().optional(),
  targetQuantity: z.coerce.number().min(0, "Target quantity cannot be negative").default(0),
  fulfilledQuantity: z.coerce.number().min(0).default(0),
  priority: z.enum(["high", "medium", "low"]).optional().default("medium"),
});

const updateSchoolInfoZodSchema = z.object({
  body: z.object({
    schoolName: z.string().optional(),
    principal: z.string().optional(),
    vicePrincipal: z.string().optional(),
    schoolWebsiteLink: z.string().optional(),
    schoolLogo: z.string().optional(),
    featuredImage: z.string().optional(),
    shortDescription: z.string().optional(),
    heroTitle: z.string().optional(),
    heroBackgroundImage: z.string().optional(),
    sectionOneTitle: z.string().optional(),
    sectionOneDescription: z.string().optional(),
    sectionOneImage: z.string().optional(),
    sectionOneImageAlt: z.string().optional(),
    sectionTwoTitle: z.string().optional(),
    sectionTwoDescription: z.string().optional(),
    gallery: z
      .array(
        z.object({
          imageUrl: z.string(),
          title: z.string().optional(),
        })
      )
      .optional(),
    schoolStats: z
      .array(
        z.object({
          title: z.string(),
        })
      )
      .optional(),
    achievements: z
      .array(
        z.object({
          title: z.string(),
        })
      )
      .optional(),
    campusNeeds: z.array(CampusNeedSchema).optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    schoolOther: z.string().optional(),
    active: z.boolean().optional(),
    enabled: z.boolean().optional(),
  }),
});

export const SchoolInfoValidation = {
  updateSchoolInfoZodSchema,
};
