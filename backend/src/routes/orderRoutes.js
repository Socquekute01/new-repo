import express from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getMyOrders,
  cancelOrder,
} from "../controllers/orderControllers.js";
import { requirePermission } from "../middleware/roleMiddleware.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route lấy orders của user hiện tại (cần xác thực)
router.get("/my", authenticateToken, getMyOrders);

// Route hủy đơn hàng (user chỉ hủy được đơn của mình)
router.put("/:id/cancel", authenticateToken, cancelOrder);

router.get("/", requirePermission("manage_orders"), getAllOrders);
router.get("/:id", authenticateToken, getOrderById); // Cho phép user xem đơn hàng của mình
router.post("/", createOrder);
router.put("/:id", requirePermission("manage_orders"), updateOrder);
router.delete("/:id", requirePermission("manage_orders"), deleteOrder);

export default router;
