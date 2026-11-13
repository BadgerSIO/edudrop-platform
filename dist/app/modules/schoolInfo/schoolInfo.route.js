"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolInfoRoutes = void 0;
const express_1 = __importDefault(require("express"));
const schoolInfo_controller_1 = require("./schoolInfo.controller");
const multerUpload_1 = require("../../middleware/multerUpload");
const verifyJWT_1 = __importDefault(require("../../middleware/verifyJWT"));
const requireRole_1 = __importDefault(require("../../middleware/requireRole"));
const router = express_1.default.Router();
router.get("/", verifyJWT_1.default, schoolInfo_controller_1.SchoolInfoController.getSingleSchoolInfoById);
router.get("/get-all", schoolInfo_controller_1.SchoolInfoController.getAllSchool);
router.get("/:slug", verifyJWT_1.default, schoolInfo_controller_1.SchoolInfoController.getSingleSchoolInfoBySlug);
router.get("/single-optimized/:slug", schoolInfo_controller_1.SchoolInfoController.getSingleSchoolInfoBySlugOptimized);
router.patch("/:id", verifyJWT_1.default, (0, requireRole_1.default)("admin", "bursar"), multerUpload_1.schoolImageUpload, schoolInfo_controller_1.SchoolInfoController.updateSchoolInfoById);
exports.SchoolInfoRoutes = router;
