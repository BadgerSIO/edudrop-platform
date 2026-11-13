"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRoutes = void 0;
const express_1 = __importDefault(require("express"));
const order_controller_1 = require("./order.controller");
const verifyJWT_1 = __importStar(require("../../middleware/verifyJWT"));
const verifyAdmin_1 = __importDefault(require("../../middleware/verifyAdmin"));
const requireRole_1 = __importDefault(require("../../middleware/requireRole"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const order_validation_1 = require("./order.validation");
const router = express_1.default.Router();
router.post("/create", verifyJWT_1.verifyOptionalJWT, (0, validateRequest_1.default)(order_validation_1.OrderValidation.createOrderSchema), order_controller_1.OrderController.createOrder);
router.get("/", verifyJWT_1.default, verifyAdmin_1.default, order_controller_1.OrderController.getAllOrder);
router.get("/get-donar-order", verifyJWT_1.default, order_controller_1.OrderController.getAllDonarOrder);
router.get("/get-bursar-order", verifyJWT_1.default, order_controller_1.OrderController.getAllBursarOrder);
router.get("/bursar-summary", verifyJWT_1.default, (0, requireRole_1.default)("bursar"), order_controller_1.OrderController.getBursarOrderSummary);
router.get("/donar-summary", verifyJWT_1.default, (0, requireRole_1.default)("donar"), order_controller_1.OrderController.getDonarOrderSummary);
router.get("/:id", verifyJWT_1.default, order_controller_1.OrderController.getSingleOrderById);
router.patch("/status/:id", verifyJWT_1.default, order_controller_1.OrderController.updateOrderStatusById);
router.patch("/payment-update/:id", verifyJWT_1.default, order_controller_1.OrderController.updateOrderPaymentById);
router.delete("/:id", verifyJWT_1.default, verifyAdmin_1.default, order_controller_1.OrderController.deleteOrderById);
exports.OrderRoutes = router;
