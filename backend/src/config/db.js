import mongoose from 'mongoose';
import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/productmanager';

const connectDB = async () => {
    try {
        const connectionString = process.env.MONGODB_CONNECTIONSTRING || 'mongodb://localhost:27017/productmanager';
        console.log('🔌 Đang kết nối MongoDB...');
        console.log('📍 Connection string:', connectionString.replace(/\/\/.*@/, '//***:***@')); // Ẩn password nếu có
        
        await mongoose.connect(connectionString); 

        console.log('✅ MongoDB đã kết nối thành công');
        console.log('📊 Database:', mongoose.connection.db.databaseName);
    } catch (error) {
        console.error('❌ Lỗi khi kết nối MongoDB:', error.message);
        console.error('💡 Kiểm tra lại connection string hoặc đảm bảo MongoDB đang chạy');
        console.error('📝 Chi tiết lỗi:', error);
        process.exit(1);
    }
};

export default connectDB;
