import express from "express";
import { NotificationController } from "./notification.controller";
import verifyJWT from "../../middleware/verifyJWT";
import verifyAdmin from "../../middleware/verifyAdmin";

const router = express.Router();

router.get("/", verifyJWT, verifyAdmin, NotificationController.getAllNotification);
router.get(
  "/by-user",
  verifyJWT,
  NotificationController.getAllNotificationByUser
);
router.get(
  "/unread-count",
  verifyJWT,
  NotificationController.getUnreadCountByUser
);
router.patch(
  "/mark-all-read",
  verifyJWT,
  NotificationController.markAllAsRead
);
router.get("/:id", verifyJWT, NotificationController.getSingleNotificationById);
router.patch("/:id", verifyJWT, NotificationController.updateNotificationById);
router.delete("/:id", verifyJWT, NotificationController.deleteNotificationById);

export const NotificationRoutes = router;
