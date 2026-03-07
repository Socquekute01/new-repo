import express from "express";
import {
  getStaffStats,
  getStaffOrders,
  updateOrderStatusByStaff,
  getLowStockProducts,
} from "../controllers/staffControllers.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { requireStaff } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/stats", authenticateToken, requireStaff, getStaffStats);
router.get("/orders", authenticateToken, requireStaff, getStaffOrders);
router.put(
  "/orders/:id/status",
  authenticateToken,
  requireStaff,
  updateOrderStatusByStaff,
);
router.get(
  "/products/low-stock",
  authenticateToken,
  requireStaff,
  getLowStockProducts,
);

export default router;
