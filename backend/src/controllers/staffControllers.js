import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const getStaffStats = async (req, res) => {
  try {
    // Pending orders count
    const pendingOrders = await Order.countDocuments({
      status: { $in: ["pending", "processing"] },
    });

    // Shipping orders count
    const shippingOrders = await Order.countDocuments({ status: "shipping" });

    // Completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = await Order.countDocuments({
      status: "completed",
      updatedAt: { $gte: today },
    });

    // Low stock products
    const lowStockProducts = await Product.countDocuments({
      stock: { $lt: 10 },
    });

    // Total orders
    const totalOrders = await Order.countDocuments();

    // Cancelled orders
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

    res.status(200).json({
      success: true,
      data: {
        pendingOrders,
        shippingOrders,
        completedToday,
        lowStockProducts,
        totalOrders,
        cancelledOrders,
      },
    });
  } catch (error) {
    console.error("Error in getStaffStats:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching staff stats",
    });
  }
};

export const getStaffOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
        },
      },
    });
  } catch (error) {
    console.error("Error in getStaffOrders:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

export const updateOrderStatusByStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Staff can only update to shipping or completed
    const allowedStatuses = ["shipping", "completed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(403).json({
        success: false,
        message: "Staff can only update orders to shipping or completed status",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error in updateOrderStatusByStaff:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating order status",
    });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ stock: { $lt: 10 } })
      .populate("category", "name")
      .sort({ stock: 1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error in getLowStockProducts:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching low stock products",
    });
  }
};
