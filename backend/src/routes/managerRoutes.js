import express from "express";
import {
  getManagerStats,
  getManagerOrders,
  getManagerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getManagerSalesReport,
  getManagerTopProducts,
  getManagerRevenueByCategory,
  getManagerCustomerStats,
  getManagerInventoryReport,
} from "../controllers/managerControllers.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { requireManager } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Manager stats
router.get("/stats", authenticateToken, requireManager, getManagerStats);

// Manager orders
router.get("/orders", authenticateToken, requireManager, getManagerOrders);

// Manager products
router.get("/products", authenticateToken, requireManager, getManagerProducts);
router.post("/products", authenticateToken, requireManager, createProduct);
router.put("/products/:id", authenticateToken, requireManager, updateProduct);
router.delete(
  "/products/:id",
  authenticateToken,
  requireManager,
  deleteProduct,
);

// Manager reports
router.get(
  "/reports/sales",
  authenticateToken,
  requireManager,
  getManagerSalesReport,
);
router.get(
  "/reports/top-products",
  authenticateToken,
  requireManager,
  getManagerTopProducts,
);
router.get(
  "/reports/revenue-by-category",
  authenticateToken,
  requireManager,
  getManagerRevenueByCategory,
);
router.get(
  "/reports/customers",
  authenticateToken,
  requireManager,
  getManagerCustomerStats,
);
router.get(
  "/reports/inventory",
  authenticateToken,
  requireManager,
  getManagerInventoryReport,
);

export default router;
