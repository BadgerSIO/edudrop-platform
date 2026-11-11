import express from "express";
import { SchoolInboxController } from "./schoolInbox.controller";
import verifyJWT from "../../middleware/verifyJWT";
import requireRole from "../../middleware/requireRole";

const router = express.Router();

router.post("/create", SchoolInboxController.createSchoolInbox);
router.get(
  "/unread-count",
  verifyJWT,
  requireRole("bursar"),
  SchoolInboxController.getUnreadCount
);
router.get(
  "/",
  verifyJWT,
  requireRole("bursar"),
  SchoolInboxController.getAllSchoolInbox
);
router.get(
  "/:id",
  verifyJWT,
  requireRole("bursar"),
  SchoolInboxController.getSingleSubmissionById
);
router.patch(
  "/:id",
  verifyJWT,
  requireRole("bursar"),
  SchoolInboxController.updateSubmissionById
);
router.delete(
  "/:id",
  verifyJWT,
  requireRole("bursar"),
  SchoolInboxController.deleteSubmissionById
);

export const SchoolInboxRoutes = router;
