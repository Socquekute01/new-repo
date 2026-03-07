import express from "express";
import {
  getSalesReport,
  getTopProducts,
  getRevenueByCategory,
  getCustomerStats,
  getInventoryReport,
} from "../controllers/reportControllers.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/sales", authenticateToken, requireAdmin, getSalesReport);
router.get("/top-products", authenticateToken, requireAdmin, getTopProducts);
router.get(
  "/revenue-by-category",
  authenticateToken,
  requireAdmin,
  getRevenueByCategory,
);
router.get("/customers", authenticateToken, requireAdmin, getCustomerStats);
router.get("/inventory", authenticateToken, requireAdmin, getInventoryReport);

export default router;
