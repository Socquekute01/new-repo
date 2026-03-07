import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getBestSellers,
} from "../controllers/productControllers.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/best-sellers", getBestSellers);
router.get("/:id", getProductById);

router.post(
  "/",
  authenticateToken,
  requirePermission("manage_products"),
  createProduct,
);

router.put(
  "/:id",
  authenticateToken,
  requirePermission("manage_products"),
  updateProduct,
);

router.delete(
  "/:id",
  authenticateToken,
  requirePermission("manage_products"),
  deleteProduct,
);

export default router;
