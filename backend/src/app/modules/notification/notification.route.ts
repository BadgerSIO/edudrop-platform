import express from "express";
import { NotificationController } from "./notification.controller";
import verifyJWT from "../../middleware/verifyJWT";
const router = express.Router();
router.get("/", verifyJWT, NotificationController.getAllNotification);
router.get(
  "/by-user",
  verifyJWT,
  NotificationController.getAllNotificationByUser
);
router.get("/:id", verifyJWT, NotificationController.getSingleNotificationById);
router.patch("/:id", verifyJWT, NotificationController.updateNotificationById);
router.delete("/:id", verifyJWT, NotificationController.deleteNotificationById);
export const NotificationRoutes = router;
