import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        unique: true,
    },
    paymentMethod: {
        type: String,
        required: true,
        trim: true,
    },
    paymentStatus: {
        type: String,
        required: true,
        trim: true,
    },
    transactionCode: {
        type: String,
        trim: true,
    },
    paidAt: {
        type: Date,
    },
}, {
    timestamps: true
});

export default mongoose.model("Payment", paymentSchema);
