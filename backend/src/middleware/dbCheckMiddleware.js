import mongoose from 'mongoose';

// Middleware để kiểm tra MongoDB connection
export const checkDBConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        console.error('❌ MongoDB chưa kết nối. ReadyState:', mongoose.connection.readyState);
        return res.status(503).json({
            success: false,
            message: "Database chưa sẵn sàng. Vui lòng thử lại sau."
        });
    }
    next();
};
