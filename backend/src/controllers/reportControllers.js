import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import OrderItem from "../models/OrderItem.js";

// Get sales report by date range
export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    // Total sales
    const totalSales = await Order.aggregate([
      { $match: { ...dateFilter, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // Orders count
    const ordersCount = await Order.countDocuments(dateFilter);

    // Average order value
    const avgOrderValue =
      totalSales.length > 0 && ordersCount > 0
        ? totalSales[0].total / ordersCount
        : 0;

    // Sales by day
    const salesByDay = await Order.aggregate([
      { $match: { ...dateFilter, status: "completed" } },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
          sales: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSales: totalSales.length > 0 ? totalSales[0].total : 0,
        ordersCount,
        avgOrderValue,
        salesByDay,
      },
    });
  } catch (error) {
    console.error("Error in getSalesReport:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching sales report",
    });
  }
};

// Get top selling products
export const getTopProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await OrderItem.aggregate([
      {
        $group: {
          _id: "$product",
          totalQuantity: { $sum: "$quantity" },
          totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
    ]);

    res.status(200).json({
      success: true,
      data: topProducts,
    });
  } catch (error) {
    console.error("Error in getTopProducts:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching top products",
    });
  }
};

// Get revenue by category
export const getRevenueByCategory = async (req, res) => {
  try {
    const revenueByCategory = await OrderItem.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $lookup: {
          from: "categories",
          localField: "productInfo.category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      {
        $group: {
          _id: "$categoryInfo._id",
          categoryName: { $first: "$categoryInfo.name" },
          totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: revenueByCategory,
    });
  } catch (error) {
    console.error("Error in getRevenueByCategory:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching revenue by category",
    });
  }
};

// Get customer statistics
export const getCustomerStats = async (req, res) => {
  try {
    // Total customers
    const totalCustomers = await User.countDocuments();

    // New customers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Top customers by spending
    const topCustomers = await Order.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        newCustomers,
        topCustomers,
      },
    });
  } catch (error) {
    console.error("Error in getCustomerStats:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching customer stats",
    });
  }
};

// Get inventory report
export const getInventoryReport = async (req, res) => {
  try {
    // Low stock products (stock < 10)
    const lowStock = await Product.find({ stock: { $lt: 10 } }).populate(
      "category",
    );

    // Out of stock products
    const outOfStock = await Product.find({ stock: 0 }).populate("category");

    // Total inventory value
    const inventoryValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        lowStock,
        outOfStock,
        inventoryValue:
          inventoryValue.length > 0
            ? inventoryValue[0]
            : { totalValue: 0, totalProducts: 0, totalStock: 0 },
      },
    });
  } catch (error) {
    console.error("Error in getInventoryReport:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching inventory report",
    });
  }
};
