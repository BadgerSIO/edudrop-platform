import express from "express";
import { CategoryController } from "./category.controller";
import verifyJWT from "../../middleware/verifyJWT";
import verifyAdmin from "../../middleware/verifyAdmin";
import validateRequest from "../../middleware/validateRequest";
import { CategoryValidation } from "./category.validation";

const router = express.Router();

router.post(
  "/create",
  verifyJWT,
  verifyAdmin,
  validateRequest(CategoryValidation.createCategoryZodSchema),
  CategoryController.createCategory
);
router.get("/", CategoryController.getAllCategory);
router.get("/:slug", CategoryController.getSingleCategoryBySlug);
router.patch(
  "/:slug",
  verifyJWT,
  verifyAdmin,
  validateRequest(CategoryValidation.updateCategoryZodSchema),
  CategoryController.updateCategoryBySlug
);
router.delete(
  "/:id",
  verifyJWT,
  verifyAdmin,
  CategoryController.deleteCategoryById
);

export const CategoryRoutes = router;
