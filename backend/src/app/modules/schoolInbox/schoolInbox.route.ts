import express from "express";
import { SchoolInboxController } from "./schoolInbox.controller";
import verifyJWT from "../../middleware/verifyJWT";

const router = express.Router();

router.post("/create", SchoolInboxController.createSchoolInbox);
router.get("/unread-count", verifyJWT, SchoolInboxController.getUnreadCount);
router.get("/", verifyJWT, SchoolInboxController.getAllSchoolInbox);
router.get("/:id", verifyJWT, SchoolInboxController.getSingleSubmissionById);
router.patch("/:id", verifyJWT, SchoolInboxController.updateSubmissionById);
router.delete("/:id", verifyJWT, SchoolInboxController.deleteSubmissionById);

export const SchoolInboxRoutes = router;
