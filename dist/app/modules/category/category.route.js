"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRoutes = void 0;
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("./category.controller");
const verifyJWT_1 = __importDefault(require("../../middleware/verifyJWT"));
const verifyAdmin_1 = __importDefault(require("../../middleware/verifyAdmin"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const category_validation_1 = require("./category.validation");
const router = express_1.default.Router();
router.post("/create", verifyJWT_1.default, verifyAdmin_1.default, (0, validateRequest_1.default)(category_validation_1.CategoryValidation.createCategoryZodSchema), category_controller_1.CategoryController.createCategory);
router.get("/", category_controller_1.CategoryController.getAllCategory);
router.get("/:slug", category_controller_1.CategoryController.getSingleCategoryBySlug);
router.patch("/:slug", verifyJWT_1.default, verifyAdmin_1.default, (0, validateRequest_1.default)(category_validation_1.CategoryValidation.updateCategoryZodSchema), category_controller_1.CategoryController.updateCategoryBySlug);
router.delete("/:id", verifyJWT_1.default, verifyAdmin_1.default, category_controller_1.CategoryController.deleteCategoryById);
exports.CategoryRoutes = router;
