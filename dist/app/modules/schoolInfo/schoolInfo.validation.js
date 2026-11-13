"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolInfoValidation = void 0;
const zod_1 = require("zod");
const CampusNeedSchema = zod_1.z.object({
    itemTitle: zod_1.z.string({ required_error: "Item title is required" }),
    productSlug: zod_1.z.string().optional(),
    targetQuantity: zod_1.z.coerce.number().min(0, "Target quantity cannot be negative").default(0),
    fulfilledQuantity: zod_1.z.coerce.number().min(0).default(0),
    priority: zod_1.z.enum(["high", "medium", "low"]).optional().default("medium"),
});
const updateSchoolInfoZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        schoolName: zod_1.z.string().optional(),
        principal: zod_1.z.string().optional(),
        vicePrincipal: zod_1.z.string().optional(),
        schoolWebsiteLink: zod_1.z.string().optional(),
        schoolLogo: zod_1.z.string().optional(),
        featuredImage: zod_1.z.string().optional(),
        shortDescription: zod_1.z.string().optional(),
        heroTitle: zod_1.z.string().optional(),
        heroBackgroundImage: zod_1.z.string().optional(),
        sectionOneTitle: zod_1.z.string().optional(),
        sectionOneDescription: zod_1.z.string().optional(),
        sectionOneImage: zod_1.z.string().optional(),
        sectionOneImageAlt: zod_1.z.string().optional(),
        sectionTwoTitle: zod_1.z.string().optional(),
        sectionTwoDescription: zod_1.z.string().optional(),
        gallery: zod_1.z
            .array(zod_1.z.object({
            imageUrl: zod_1.z.string(),
            title: zod_1.z.string().optional(),
        }))
            .optional(),
        schoolStats: zod_1.z
            .array(zod_1.z.object({
            title: zod_1.z.string(),
        }))
            .optional(),
        achievements: zod_1.z
            .array(zod_1.z.object({
            title: zod_1.z.string(),
        }))
            .optional(),
        campusNeeds: zod_1.z.array(CampusNeedSchema).optional(),
        metaTitle: zod_1.z.string().optional(),
        metaDescription: zod_1.z.string().optional(),
        schoolOther: zod_1.z.string().optional(),
        active: zod_1.z.boolean().optional(),
        enabled: zod_1.z.boolean().optional(),
    }),
});
exports.SchoolInfoValidation = {
    updateSchoolInfoZodSchema,
};
