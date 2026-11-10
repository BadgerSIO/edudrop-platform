import express from "express";
import { SchoolInfoController } from "./schoolInfo.controller";
import { schoolImageUpload } from "../../middleware/multerUpload";
import verifyJWT from "../../middleware/verifyJWT";
import requireRole from "../../middleware/requireRole";

const router = express.Router();

router.get("/", verifyJWT, SchoolInfoController.getSingleSchoolInfoById);
router.get("/get-all", SchoolInfoController.getAllSchool);
router.get("/:slug", verifyJWT, SchoolInfoController.getSingleSchoolInfoBySlug);
router.get(
  "/single-optimized/:slug",
  SchoolInfoController.getSingleSchoolInfoBySlugOptimized
);
router.patch(
  "/:id",
  verifyJWT,
  requireRole("admin", "bursar"),
  schoolImageUpload,
  SchoolInfoController.updateSchoolInfoById
);

export const SchoolInfoRoutes = router;
