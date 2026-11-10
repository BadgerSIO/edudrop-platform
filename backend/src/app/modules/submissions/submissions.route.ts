import express from "express";
import { SubmissionsController } from "./submissions.controller";
import verifyJWT from "../../middleware/verifyJWT";
import verifyAdmin from "../../middleware/verifyAdmin";

const router = express.Router();

router.post("/create", SubmissionsController.createSubmissions);
router.get(
  "/unread-count",
  verifyJWT,
  verifyAdmin,
  SubmissionsController.getUnreadCount
);
router.get("/", verifyJWT, verifyAdmin, SubmissionsController.getAllSubmissions);
router.get(
  "/:id",
  verifyJWT,
  verifyAdmin,
  SubmissionsController.getSingleSubmissionById
);
router.patch(
  "/:id",
  verifyJWT,
  verifyAdmin,
  SubmissionsController.updateSubmissionById
);
router.delete(
  "/:id",
  verifyJWT,
  verifyAdmin,
  SubmissionsController.deleteSubmissionById
);

export const SubmissionsRoutes = router;
