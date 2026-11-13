"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CMSRoutes = void 0;
const express_1 = __importDefault(require("express"));
const cms_controller_1 = require("./cms.controller");
const verifyJWT_1 = __importDefault(require("../../middleware/verifyJWT"));
const verifyAdmin_1 = __importDefault(require("../../middleware/verifyAdmin"));
const multerUpload_1 = require("../../middleware/multerUpload");
const router = express_1.default.Router();
// Public: fetch site content for homepage and layout
router.get("/", cms_controller_1.CMSController.getSiteContent);
// Protected: Admin CMS updates
router.patch("/", verifyJWT_1.default, verifyAdmin_1.default, cms_controller_1.CMSController.updateSiteContent);
router.post("/upload", verifyJWT_1.default, verifyAdmin_1.default, multerUpload_1.cmsImageUpload, cms_controller_1.CMSController.uploadMedia);
router.post("/upload-image", verifyJWT_1.default, verifyAdmin_1.default, multerUpload_1.cmsImageUpload, cms_controller_1.CMSController.uploadMedia);
// Works management
router.post("/works", verifyJWT_1.default, verifyAdmin_1.default, cms_controller_1.CMSController.addOurWork);
router.patch("/works/:id", verifyJWT_1.default, verifyAdmin_1.default, cms_controller_1.CMSController.updateOurWork);
router.delete("/works/:id", verifyJWT_1.default, verifyAdmin_1.default, cms_controller_1.CMSController.deleteOurWork);
// Testimonials management
router.post("/testimonials", verifyJWT_1.default, verifyAdmin_1.default, cms_controller_1.CMSController.addTestimonial);
router.patch("/testimonials/:id", verifyJWT_1.default, verifyAdmin_1.default, cms_controller_1.CMSController.updateTestimonial);
router.delete("/testimonials/:id", verifyJWT_1.default, verifyAdmin_1.default, cms_controller_1.CMSController.deleteTestimonial);
exports.CMSRoutes = router;
