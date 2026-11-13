"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const notification_controller_1 = require("./notification.controller");
const verifyJWT_1 = __importDefault(require("../../middleware/verifyJWT"));
const verifyAdmin_1 = __importDefault(require("../../middleware/verifyAdmin"));
const router = express_1.default.Router();
router.get("/", verifyJWT_1.default, verifyAdmin_1.default, notification_controller_1.NotificationController.getAllNotification);
router.get("/by-user", verifyJWT_1.default, notification_controller_1.NotificationController.getAllNotificationByUser);
router.get("/unread-count", verifyJWT_1.default, notification_controller_1.NotificationController.getUnreadCountByUser);
router.patch("/mark-all-read", verifyJWT_1.default, notification_controller_1.NotificationController.markAllAsRead);
router.get("/:id", verifyJWT_1.default, notification_controller_1.NotificationController.getSingleNotificationById);
router.patch("/:id", verifyJWT_1.default, notification_controller_1.NotificationController.updateNotificationById);
router.delete("/:id", verifyJWT_1.default, notification_controller_1.NotificationController.deleteNotificationById);
exports.NotificationRoutes = router;
