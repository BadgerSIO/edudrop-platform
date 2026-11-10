import express from "express";
import { ProductController } from "./product.controller";
import verifyJWT from "../../middleware/verifyJWT";
import verifyAdmin from "../../middleware/verifyAdmin";
import { productUpload } from "../../middleware/multerUpload";

const router = express.Router();

// Dedicated Image Upload Route
router.post(
  "/upload-image",
  verifyJWT,
  verifyAdmin,
  productUpload,
  ProductController.uploadImage
);

router.get("/", ProductController.getAllProduct);
router.post(
  "/create",
  verifyJWT,
  verifyAdmin,
  productUpload,
  ProductController.createProduct
);
router.post("/productsBySlugs", ProductController.productsBySlugs);
router.get("/get-all", ProductController.getAllProductOptimized);
router.get("/optimized/:slug", ProductController.getProductBySlug);
router.get("/:slug", ProductController.getSingleProductBySlug);
router.patch(
  "/:id",
  verifyJWT,
  verifyAdmin,
  productUpload,
  ProductController.updateProductById
);
router.patch(
  "/status/:slug",
  verifyJWT,
  verifyAdmin,
  ProductController.updateProductStatusByIdOrSlug
);
router.delete(
  "/:id",
  verifyJWT,
  verifyAdmin,
  ProductController.deleteProductById
);

export const ProductRoutes = router;
