import express from "express";
import {
  getAllReviews,
  getReviewById,
  getReviewsByProduct,
  getMyReviews,
  createOrUpdateReview,
  updateReview,
  deleteReview,
  canReviewProduct,
} from "../controllers/reviewControllers.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public product reviews
router.get("/product/:productId", getReviewsByProduct);

// User reviews
router.get("/me", authenticateToken, getMyReviews);
router.get("/can-review/:productId", authenticateToken, canReviewProduct);
router.post("/product/:productId", authenticateToken, createOrUpdateReview);
router.put("/:id", authenticateToken, updateReview);
router.delete("/:id", authenticateToken, deleteReview);

// Admin overview
router.get("/", authenticateToken, requireAdmin, getAllReviews);
router.get("/:id", authenticateToken, requireAdmin, getReviewById);

export default router;
