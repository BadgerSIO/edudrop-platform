import express from "express";
import { CMSController } from "./cms.controller";
import verifyJWT from "../../middleware/verifyJWT";
import verifyAdmin from "../../middleware/verifyAdmin";
import { cmsImageUpload } from "../../middleware/multerUpload";

const router = express.Router();

// Public: fetch site content for homepage and layout
router.get("/", CMSController.getSiteContent);

// Protected: Admin CMS updates
router.patch("/", verifyJWT, verifyAdmin, CMSController.updateSiteContent);
router.post(
  "/upload",
  verifyJWT,
  verifyAdmin,
  cmsImageUpload,
  CMSController.uploadMedia
);

// Works management
router.post("/works", verifyJWT, verifyAdmin, CMSController.addOurWork);
router.patch("/works/:id", verifyJWT, verifyAdmin, CMSController.updateOurWork);
router.delete("/works/:id", verifyJWT, verifyAdmin, CMSController.deleteOurWork);

// Testimonials management
router.post("/testimonials", verifyJWT, verifyAdmin, CMSController.addTestimonial);
router.patch(
  "/testimonials/:id",
  verifyJWT,
  verifyAdmin,
  CMSController.updateTestimonial
);
router.delete(
  "/testimonials/:id",
  verifyJWT,
  verifyAdmin,
  CMSController.deleteTestimonial
);

export const CMSRoutes = router;
