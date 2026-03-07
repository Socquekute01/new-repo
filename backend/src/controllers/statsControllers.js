import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Total Revenue from completed orders
    const completedOrders = await Order.find({ status: "completed" });
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    // Count new users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersCount = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Total orders count
    const totalOrders = await Order.countDocuments();

    // Total users count
    const totalUsers = await User.countDocuments();

    // Total products count
    const totalProducts = await Product.countDocuments();

    // Recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "username email");

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        newUsersCount,
        totalOrders,
        totalUsers,
        totalProducts,
        recentOrders,
        monthlyRevenue,
        ordersByStatus,
      },
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard stats",
    });
  }
};
