"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const submissions_controller_1 = require("./submissions.controller");
const verifyJWT_1 = __importDefault(require("../../middleware/verifyJWT"));
const verifyAdmin_1 = __importDefault(require("../../middleware/verifyAdmin"));
const router = express_1.default.Router();
router.post("/create", submissions_controller_1.SubmissionsController.createSubmissions);
router.get("/unread-count", verifyJWT_1.default, verifyAdmin_1.default, submissions_controller_1.SubmissionsController.getUnreadCount);
router.get("/", verifyJWT_1.default, verifyAdmin_1.default, submissions_controller_1.SubmissionsController.getAllSubmissions);
router.get("/:id", verifyJWT_1.default, verifyAdmin_1.default, submissions_controller_1.SubmissionsController.getSingleSubmissionById);
router.patch("/:id", verifyJWT_1.default, verifyAdmin_1.default, submissions_controller_1.SubmissionsController.updateSubmissionById);
router.delete("/:id", verifyJWT_1.default, verifyAdmin_1.default, submissions_controller_1.SubmissionsController.deleteSubmissionById);
exports.SubmissionsRoutes = router;
