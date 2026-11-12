import express from "express";
import { OrderController } from "./order.controller";
import verifyJWT, { verifyOptionalJWT } from "../../middleware/verifyJWT";
import verifyAdmin from "../../middleware/verifyAdmin";
import requireRole from "../../middleware/requireRole";
import validateRequest from "../../middleware/validateRequest";
import { OrderValidation } from "./order.validation";

const router = express.Router();

router.post(
  "/create",
  verifyOptionalJWT,
  validateRequest(OrderValidation.createOrderSchema),
  OrderController.createOrder
);
router.get("/", verifyJWT, verifyAdmin, OrderController.getAllOrder);

router.get("/get-donar-order", verifyJWT, OrderController.getAllDonarOrder);
router.get("/get-bursar-order", verifyJWT, OrderController.getAllBursarOrder);
router.get(
  "/bursar-summary",
  verifyJWT,
  requireRole("bursar"),
  OrderController.getBursarOrderSummary
);
router.get(
  "/donar-summary",
  verifyJWT,
  requireRole("donar"),
  OrderController.getDonarOrderSummary
);
router.get("/:id", verifyJWT, OrderController.getSingleOrderById);
router.patch("/status/:id", verifyJWT, OrderController.updateOrderStatusById);
router.patch(
  "/payment-update/:id",
  verifyJWT,
  OrderController.updateOrderPaymentById
);
router.delete("/:id", verifyJWT, verifyAdmin, OrderController.deleteOrderById);

export const OrderRoutes = router;
