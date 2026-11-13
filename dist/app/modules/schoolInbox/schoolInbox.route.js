"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolInboxRoutes = void 0;
const express_1 = __importDefault(require("express"));
const schoolInbox_controller_1 = require("./schoolInbox.controller");
const verifyJWT_1 = __importDefault(require("../../middleware/verifyJWT"));
const requireRole_1 = __importDefault(require("../../middleware/requireRole"));
const router = express_1.default.Router();
router.post("/create", schoolInbox_controller_1.SchoolInboxController.createSchoolInbox);
router.get("/unread-count", verifyJWT_1.default, (0, requireRole_1.default)("bursar"), schoolInbox_controller_1.SchoolInboxController.getUnreadCount);
router.get("/", verifyJWT_1.default, (0, requireRole_1.default)("bursar"), schoolInbox_controller_1.SchoolInboxController.getAllSchoolInbox);
router.get("/:id", verifyJWT_1.default, (0, requireRole_1.default)("bursar"), schoolInbox_controller_1.SchoolInboxController.getSingleSubmissionById);
router.patch("/:id", verifyJWT_1.default, (0, requireRole_1.default)("bursar"), schoolInbox_controller_1.SchoolInboxController.updateSubmissionById);
router.delete("/:id", verifyJWT_1.default, (0, requireRole_1.default)("bursar"), schoolInbox_controller_1.SchoolInboxController.deleteSubmissionById);
exports.SchoolInboxRoutes = router;
