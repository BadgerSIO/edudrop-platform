"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("./admin.controller");
const verifyJWT_1 = __importDefault(require("../../middleware/verifyJWT"));
const verifyAdmin_1 = __importDefault(require("../../middleware/verifyAdmin"));
const requireRole_1 = __importDefault(require("../../middleware/requireRole"));
const router = express_1.default.Router();
router.get("/get-counts", verifyJWT_1.default, verifyAdmin_1.default, admin_controller_1.AdminController.getCounts);
router.get("/me", verifyJWT_1.default, (0, requireRole_1.default)("admin"), admin_controller_1.AdminController.getMyProfile);
router.get("/:id", verifyJWT_1.default, verifyAdmin_1.default, admin_controller_1.AdminController.getSingleAdmin);
router.delete("/:id", verifyJWT_1.default, verifyAdmin_1.default, admin_controller_1.AdminController.deleteAdmin);
exports.AdminRoutes = router;
