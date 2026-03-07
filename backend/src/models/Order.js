import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    email: {
        type: String,
        trim: true,
    },
    shippingAddress: {
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        phone: { type: String, trim: true },
        address: { type: String, trim: true },
        district: { type: String, trim: true },
        city: { type: String, trim: true },
    },
    paymentMethod: {
        type: String,
        trim: true,
        enum: ["cod", "vnpay"],
    },
    shippingFee: {
        type: Number,
        min: 0,
        default: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "paid", "shipped", "completed", "cancelled"],
    },
}, {
    timestamps: true
});

export default mongoose.model("Order", orderSchema);
