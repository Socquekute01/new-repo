import mongoose from "mongoose";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";

const updateProductAverageRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);
  const averageRating = stats[0]?.averageRating ?? 0;
  await Product.findByIdAndUpdate(productId, { averageRating });
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "username name")
      .populate("product", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error in getAllReviews:", error);
    res.status(500).json({ message: "Server error while fetching reviews" });
  }
};

export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("user", "username name")
      .populate("product", "name");
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json(review);
  } catch (error) {
    console.error("Error in getReviewById:", error);
    res.status(500).json({ message: "Server error while fetching review" });
  }
};

export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    const reviews = await Review.find({ product: productId })
      .populate("user", "username name")
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error in getReviewsByProduct:", error);
    res.status(500).json({ message: "Server error while fetching reviews" });
  }
};

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.userId })
      .populate("product", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error in getMyReviews:", error);
    res.status(500).json({ message: "Server error while fetching reviews" });
  }
};

export const createOrUpdateReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Kiểm tra xem user đã mua sản phẩm này với đơn hàng completed chưa
    const completedOrders = await Order.find({
      user: req.userId,
      status: "completed",
    }).select("_id");

    if (completedOrders.length === 0) {
      return res.status(403).json({
        message:
          "Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã hoàn thành",
      });
    }

    const orderIds = completedOrders.map((order) => order._id);
    const hasPurchased = await OrderItem.findOne({
      order: { $in: orderIds },
      product: productId,
    });

    if (!hasPurchased) {
      return res.status(403).json({
        message:
          "Bạn chỉ có thể đánh giá sản phẩm đã mua và đơn hàng đã hoàn thành",
      });
    }

    const existing = await Review.findOne({
      user: req.userId,
      product: productId,
    });

    let review;
    if (existing) {
      existing.rating = rating;
      existing.comment = comment ?? existing.comment;
      review = await existing.save();
    } else {
      review = await Review.create({
        user: req.userId,
        product: productId,
        rating,
        comment,
      });
    }

    await updateProductAverageRating(productId);
    res.status(201).json(review);
  } catch (error) {
    console.error("Error in createOrUpdateReview:", error);
    res.status(500).json({ message: "Server error while creating review" });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (String(review.user) !== String(req.userId)) {
      const requester = await User.findById(req.userId).select("role");
      if (!requester || requester.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ message: "Rating must be between 1 and 5" });
      }
      review.rating = rating;
    }
    if (comment !== undefined) {
      review.comment = comment;
    }

    const updatedReview = await review.save();
    await updateProductAverageRating(review.product);
    res.status(200).json(updatedReview);
  } catch (error) {
    console.error("Error in updateReview:", error);
    res.status(500).json({ message: "Server error while updating review" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (String(review.user) !== String(req.userId)) {
      const requester = await User.findById(req.userId).select("role");
      if (!requester || requester.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    await review.deleteOne();
    await updateProductAverageRating(review.product);
    res.status(200).json(review);
  } catch (error) {
    console.error("Error in deleteReview:", error);
    res.status(500).json({ message: "Server error while deleting review" });
  }
};

// Kiểm tra xem user có thể review sản phẩm không
export const canReviewProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    // Tìm tất cả đơn hàng completed của user
    const completedOrders = await Order.find({
      user: req.userId,
      status: "completed",
    }).select("_id");

    if (completedOrders.length === 0) {
      return res.status(200).json({
        canReview: false,
        message:
          "Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã hoàn thành",
      });
    }

    const orderIds = completedOrders.map((order) => order._id);
    const hasPurchased = await OrderItem.findOne({
      order: { $in: orderIds },
      product: productId,
    });

    if (!hasPurchased) {
      return res.status(200).json({
        canReview: false,
        message:
          "Bạn chỉ có thể đánh giá sản phẩm đã mua và đơn hàng đã hoàn thành",
      });
    }

    return res.status(200).json({
      canReview: true,
      message: "Bạn có thể đánh giá sản phẩm này",
    });
  } catch (error) {
    console.error("Error in canReviewProduct:", error);
    res
      .status(500)
      .json({ message: "Server error while checking review eligibility" });
  }
};
