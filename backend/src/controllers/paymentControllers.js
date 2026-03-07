import Payment from '../models/Payment.js';
import Order from '../models/Order.js';

export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 });
        res.status(200).json(payments);
    } catch (error) {
        console.error("Error in getAllPayments:", error);
        res.status(500).json({ message: "Server error while fetching payments" });
    }
};

export const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }
        res.status(200).json(payment);
    } catch (error) {
        console.error("Error in getPaymentById:", error);
        res.status(500).json({ message: "Server error while fetching payment" });
    }
};

export const createPayment = async (req, res) => {
    try {
        const { order, paymentMethod, paymentStatus, transactionCode, paidAt } = req.body;
        if (!order || !paymentMethod || !paymentStatus) {
            return res.status(400).json({ message: "order, paymentMethod and paymentStatus are required" });
        }

        const existing = await Payment.findOne({ order });
        if (existing) {
            return res.status(400).json({ message: "Payment already exists for this order" });
        }

        const orderDoc = await Order.findById(order);
        if (!orderDoc) {
            return res.status(404).json({ message: "Order not found" });
        }

        const payment = new Payment({ order, paymentMethod, paymentStatus, transactionCode, paidAt });
        const newPayment = await payment.save();

        if (paymentStatus === 'paid') {
            orderDoc.status = 'paid';
            await orderDoc.save();
        }

        res.status(201).json(newPayment);
    } catch (error) {
        console.error("Error in createPayment:", error);
        res.status(500).json({ message: "Server error while creating payment" });
    }
};

export const updatePayment = async (req, res) => {
    try {
        const { paymentMethod, paymentStatus, transactionCode, paidAt } = req.body;
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        if (paymentMethod !== undefined) payment.paymentMethod = paymentMethod;
        if (paymentStatus !== undefined) payment.paymentStatus = paymentStatus;
        if (transactionCode !== undefined) payment.transactionCode = transactionCode;
        if (paidAt !== undefined) payment.paidAt = paidAt;

        const updatedPayment = await payment.save();

        if (paymentStatus === 'paid') {
            const orderDoc = await Order.findById(payment.order);
            if (orderDoc) {
                orderDoc.status = 'paid';
                await orderDoc.save();
            }
        }

        res.status(200).json(updatedPayment);
    } catch (error) {
        console.error("Error in updatePayment:", error);
        res.status(500).json({ message: "Server error while updating payment" });
    }
};

export const deletePayment = async (req, res) => {
    try {
        const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
        if (!deletedPayment) {
            return res.status(404).json({ message: "Payment not found" });
        }
        res.status(200).json(deletedPayment);
    } catch (error) {
        console.error("Error in deletePayment:", error);
        res.status(500).json({ message: "Server error while deleting payment" });
    }
};
