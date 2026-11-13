"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRoutes = void 0;
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("./product.controller");
const verifyJWT_1 = __importDefault(require("../../middleware/verifyJWT"));
const verifyAdmin_1 = __importDefault(require("../../middleware/verifyAdmin"));
const multerUpload_1 = require("../../middleware/multerUpload");
const router = express_1.default.Router();
// Dedicated Image Upload Route
router.post("/upload-image", verifyJWT_1.default, verifyAdmin_1.default, multerUpload_1.productUpload, product_controller_1.ProductController.uploadImage);
router.get("/", product_controller_1.ProductController.getAllProduct);
router.post("/create", verifyJWT_1.default, verifyAdmin_1.default, multerUpload_1.productUpload, product_controller_1.ProductController.createProduct);
router.post("/productsBySlugs", product_controller_1.ProductController.productsBySlugs);
router.get("/get-all", product_controller_1.ProductController.getAllProductOptimized);
router.get("/optimized/:slug", product_controller_1.ProductController.getProductBySlug);
router.get("/:slug", product_controller_1.ProductController.getSingleProductBySlug);
router.patch("/:id", verifyJWT_1.default, verifyAdmin_1.default, multerUpload_1.productUpload, product_controller_1.ProductController.updateProductById);
router.patch("/status/:slug", verifyJWT_1.default, verifyAdmin_1.default, product_controller_1.ProductController.updateProductStatusByIdOrSlug);
router.delete("/:id", verifyJWT_1.default, verifyAdmin_1.default, product_controller_1.ProductController.deleteProductById);
exports.ProductRoutes = router;
