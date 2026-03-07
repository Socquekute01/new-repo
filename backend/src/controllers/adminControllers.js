import User from "../models/User.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Payment from "../models/Payment.js";

export const getAdminStats = async (req, res) => {
    try {
        const [
            userCount,
            productCount,
            categoryCount,
            reviewCount,
            orderCount,
            orderItemCount,
            paymentCount,
            orderStatusStats,
            paidRevenue
        ] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Category.countDocuments(),
            Review.countDocuments(),
            Order.countDocuments(),
            OrderItem.countDocuments(),
            Payment.countDocuments(),
            Order.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]),
            Order.aggregate([
                { $match: { status: { $in: ["paid", "completed"] } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ])
        ]);

        const orderStatusCounts = orderStatusStats.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        const totalRevenue = paidRevenue.length > 0 ? paidRevenue[0].total : 0;

        res.status(200).json({
            success: true,
            data: {
                counts: {
                    users: userCount,
                    products: productCount,
                    categories: categoryCount,
                    reviews: reviewCount,
                    orders: orderCount,
                    orderItems: orderItemCount,
                    payments: paymentCount
                },
                orders: {
                    byStatus: orderStatusCounts
                },
                revenue: {
                    paidTotal: totalRevenue
                }
            }
        });
    } catch (error) {
        console.error("Error in getAdminStats:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching admin stats"
        });
    }
};
