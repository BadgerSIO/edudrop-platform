import express from "express";
import { SchoolController } from "./school.controller";
import verifyJWT from "../../middleware/verifyJWT";
import verifyAdmin from "../../middleware/verifyAdmin";
import requireRole from "../../middleware/requireRole";
import validateRequest from "../../middleware/validateRequest";
import { SchoolValidation } from "./school.validation";
import { schoolSingleUpload } from "../../middleware/multerUpload";

const router = express.Router();

router.post(
  "/upload-image",
  verifyJWT,
  requireRole("admin", "bursar"),
  schoolSingleUpload,
  SchoolController.uploadImage
);

router.post(
  "/create",
  verifyJWT,
  verifyAdmin,
  validateRequest(SchoolValidation.createSchoolZodSchema),
  SchoolController.createSchool
);

router.get("/get-status", verifyJWT, SchoolController.getSchoolStatus);
router.get("/", SchoolController.getAllSchool);
router.get("/:slug", SchoolController.getSingleSchoolBySlug);

router.patch(
  "/:id",
  verifyJWT,
  requireRole("admin", "bursar"),
  validateRequest(SchoolValidation.updateSchoolZodSchema),
  SchoolController.updateSchoolById
);

router.patch(
  "/status-update/:slug",
  verifyJWT,
  verifyAdmin,
  SchoolController.updateSchoolStatus
);

router.delete(
  "/:id",
  verifyJWT,
  verifyAdmin,
  SchoolController.deleteSchoolById
);

export const SchoolRoutes = router;
