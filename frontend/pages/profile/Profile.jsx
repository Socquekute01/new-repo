import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import { authAPI, orderAPI } from '../../src/services/api';
import { toast } from 'sonner';
import Header from '../../src/components/header/Header';
import Footer from '../../src/components/footer/Footer';

export default function Profile() {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile'); // profile, orders, settings
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        address: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        }
    }, [user]);

    // Load orders when orders tab is active
    useEffect(() => {
        const fetchOrders = async () => {
            if (activeTab === 'orders' && user) {
                try {
                    setLoadingOrders(true);
                    const response = await orderAPI.getMyOrders();
                    if (response.success) {
                        setOrders(response.data || []);
                    }
                } catch (error) {
                    console.error('Fetch orders error:', error);
                    toast.error('Không thể tải danh sách đơn hàng');
                } finally {
                    setLoadingOrders(false);
                }
            }
        };

        fetchOrders();
    }, [activeTab, user]);

    // Fetch order details
    const fetchOrderDetails = async (orderId) => {
        try {
            setLoadingOrderDetails(true);
            const response = await orderAPI.getById(orderId);
            setOrderDetails(response);
            setShowOrderModal(true);
        } catch (error) {
            console.error('Fetch order details error:', error);
            toast.error('Không thể tải chi tiết đơn hàng');
        } finally {
            setLoadingOrderDetails(false);
        }
    };

    const closeModal = () => {
        setShowOrderModal(false);
        setSelectedOrder(null);
        setOrderDetails(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const updateData = {
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
            };

            await authAPI.updateProfile(updateData);
            // Refresh user data from server
            await updateUser();
            toast.success('Cập nhật thông tin thành công!');
            setIsEditing(false);
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error(error.response?.data?.message || 'Cập nhật thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp!');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
            return;
        }

        try {
            setLoading(true);
            await authAPI.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });
            toast.success('Đổi mật khẩu thành công!');
            setFormData({
                ...formData,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            console.error('Change password error:', error);
            toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Đăng xuất thành công!');
        navigate('/');
    };

    // Kiểm tra xem đơn hàng có thể hủy không
    const canCancelOrder = (order) => {
        // Không cho phép hủy nếu đơn hàng đã bị hủy, đang giao hoặc đã hoàn tất
        if (order.status === 'cancelled' || order.status === 'shipped' || order.status === 'completed') {
            return false;
        }
        // Chỉ cho phép hủy trong vòng 24 giờ
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const hoursSinceCreated = (now - orderDate) / (1000 * 60 * 60);
        return hoursSinceCreated <= 24;
    };

    const handleCancelOrder = async (orderId) => {
        setOrderToCancel(orderId);
        setShowCancelConfirm(true);
    };

    const confirmCancelOrder = async () => {
        if (!orderToCancel) return;

        try {
            const response = await orderAPI.cancel(orderToCancel);
            if (response.success) {
                toast.success('Hủy đơn hàng thành công!');
                // Reload orders
                const ordersResponse = await orderAPI.getMyOrders();
                if (ordersResponse.success) {
                    setOrders(ordersResponse.data || []);
                }
                // Close modal if open
                if (showOrderModal && selectedOrder?._id === orderToCancel) {
                    closeModal();
                }
            }
        } catch (error) {
            console.error('Cancel order error:', error);
            toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng');
        } finally {
            setShowCancelConfirm(false);
            setOrderToCancel(null);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-600 text-lg mb-6">Vui lòng đăng nhập để xem trang này</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-black text-white px-8 py-3 font-bold hover:bg-gray-800 transition-colors"
                    >
                        Đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Profile Header */}
                <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-black to-gray-700 flex items-center justify-center text-white text-3xl font-bold">
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {user.username || 'User'}
                            </h1>
                            <p className="text-gray-600">{user.email}</p>
                            <div className="flex gap-4 mt-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-black text-white">
                                    {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                                </span>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="px-6 py-2 border-2 border-red-600 text-red-600 font-semibold hover:bg-red-600 hover:text-white transition-colors rounded"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`py-4 px-8 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile'
                                    ? 'border-black text-black'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Thông tin cá nhân
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`py-4 px-8 text-sm font-medium border-b-2 transition-colors ${activeTab === 'orders'
                                    ? 'border-black text-black'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Đơn hàng của tôi
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`py-4 px-8 text-sm font-medium border-b-2 transition-colors ${activeTab === 'settings'
                                    ? 'border-black text-black'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Cài đặt
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h2>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-6 py-2 bg-black text-white font-semibold hover:bg-gray-800 transition-colors rounded"
                                        >
                                            Chỉnh sửa
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleUpdateProfile}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Username */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tên người dùng
                                            </label>
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black transition-colors disabled:bg-gray-100 disabled:text-gray-600"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                disabled
                                                className="w-full px-4 py-3 border border-gray-300 rounded bg-gray-100 text-gray-600 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Số điện thoại
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black transition-colors disabled:bg-gray-100 disabled:text-gray-600"
                                            />
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Địa chỉ
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black transition-colors disabled:bg-gray-100 disabled:text-gray-600"
                                            />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex gap-4 mt-6">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-8 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors rounded disabled:bg-gray-400"
                                            >
                                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors rounded"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Đơn hàng của tôi</h2>
                                {loadingOrders ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                                        <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <svg
                                            className="w-24 h-24 text-gray-300 mx-auto mb-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                            />
                                        </svg>
                                        <p className="text-gray-500 text-lg">Bạn chưa có đơn hàng nào</p>
                                        <button
                                            onClick={() => navigate('/shop')}
                                            className="mt-6 px-8 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors rounded"
                                        >
                                            Mua sắm ngay
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div
                                                key={order._id}
                                                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                                            >
                                                {/* Header */}
                                                <div className="flex justify-between items-start mb-4 pb-4 border-b">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <p className="text-sm text-gray-500">
                                                                Mã đơn hàng: <span className="font-semibold text-gray-900">#{order._id?.slice(-8).toUpperCase()}</span>
                                                            </p>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                                        order.status === 'paid' ? 'bg-purple-100 text-purple-800' :
                                                                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {order.status === 'completed' ? 'Hoàn thành' :
                                                                    order.status === 'shipped' ? 'Đang giao hàng' :
                                                                        order.status === 'paid' ? 'Đã thanh toán' :
                                                                            order.status === 'cancelled' ? 'Đã hủy' :
                                                                                order.status === 'pending' ? 'Chờ xử lý' :
                                                                                    order.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500">
                                                            <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN', {
                                                                year: 'numeric',
                                                                month: '2-digit',
                                                                day: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Chi tiết đơn hàng */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                    {/* Phương thức thanh toán */}
                                                    <div className="flex items-start gap-2">
                                                        <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                        </svg>
                                                        <div className="flex-1">
                                                            <p className="text-xs text-gray-500">Thanh toán</p>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {order.paymentMethod === 'vnpay' ? 'VNPay' :
                                                                    order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' :
                                                                        order.paymentMethod || 'Chưa xác định'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Email */}
                                                    {order.email && (
                                                        <div className="flex items-start gap-2">
                                                            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            <div className="flex-1">
                                                                <p className="text-xs text-gray-500">Email</p>
                                                                <p className="text-sm font-medium text-gray-900 truncate">{order.email}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Địa chỉ */}
                                                    {order.shippingAddress && (
                                                        <div className="flex items-start gap-2">
                                                            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <div className="flex-1">
                                                                <p className="text-xs text-gray-500">Địa chỉ giao hàng</p>
                                                                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                                                    {typeof order.shippingAddress === 'string'
                                                                        ? order.shippingAddress
                                                                        : `${order.shippingAddress.address || ''}, ${order.shippingAddress.district || ''}, ${order.shippingAddress.city || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Tổng tiền và actions */}
                                                <div className="border-t pt-4 flex justify-between items-center">
                                                    <div className="flex gap-8">
                                                        {/* Tổng tiền hàng */}
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Tiền hàng</p>
                                                            <p className="text-lg font-semibold text-gray-900">
                                                                {order.totalAmount?.toLocaleString('vi-VN')}₫
                                                            </p>
                                                        </div>

                                                        {/* Phí vận chuyển */}
                                                        {order.shippingFee > 0 && (
                                                            <div>
                                                                <p className="text-xs text-gray-500 mb-1">Phí vận chuyển</p>
                                                                <p className="text-lg font-semibold text-blue-600">
                                                                    +{order.shippingFee?.toLocaleString('vi-VN')}₫
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Tổng thanh toán */}
                                                        <div className="border-l pl-8">
                                                            <p className="text-xs text-gray-500 mb-1">Tổng thanh toán</p>
                                                            <p className="text-2xl font-bold text-red-600">
                                                                {((order.totalAmount || 0) + (order.shippingFee || 0)).toLocaleString('vi-VN')}₫
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedOrder(order);
                                                                fetchOrderDetails(order._id);
                                                            }}
                                                            disabled={loadingOrderDetails}
                                                            className="px-6 py-2.5 bg-black text-white font-semibold hover:bg-gray-800 hover:shadow-lg transition-all rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {loadingOrderDetails ? 'Đang tải...' : 'Xem chi tiết'}
                                                        </button>

                                                        {canCancelOrder(order) && (
                                                            <button
                                                                onClick={() => handleCancelOrder(order._id)}
                                                                className="px-6 py-2.5 bg-red-600 text-white font-semibold hover:bg-red-700 hover:shadow-lg transition-all rounded"
                                                            >
                                                                Hủy đơn
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Đổi mật khẩu</h2>
                                <form onSubmit={handleChangePassword} className="max-w-xl">
                                    <div className="space-y-6">
                                        {/* Current Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mật khẩu hiện tại
                                            </label>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={formData.currentPassword}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
                                                required
                                            />
                                        </div>

                                        {/* New Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mật khẩu mới
                                            </label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
                                                required
                                            />
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Xác nhận mật khẩu mới
                                            </label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="mt-6 px-8 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors rounded disabled:bg-gray-400"
                                    >
                                        {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />

            {/* Order Details Modal */}
            {showOrderModal && orderDetails && (
                <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Mã đơn: #{selectedOrder?._id?.slice(-8).toUpperCase()}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Order Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Status */}
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Trạng thái</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${selectedOrder?.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            selectedOrder?.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                selectedOrder?.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {selectedOrder?.status === 'completed' ? 'Hoàn thành' :
                                                selectedOrder?.status === 'processing' ? 'Đang xử lý' :
                                                    selectedOrder?.status === 'cancelled' ? 'Đã hủy' :
                                                        'Chờ xử lý'}
                                        </span>
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Ngày đặt hàng</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(selectedOrder?.createdAt).toLocaleString('vi-VN', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                                        <p className="font-medium text-gray-900">
                                            {selectedOrder?.paymentMethod === 'vnpay' ? 'VNPay' :
                                                selectedOrder?.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' :
                                                    selectedOrder?.paymentMethod || 'Chưa xác định'}
                                        </p>
                                    </div>
                                </div>

                                {/* Email */}
                                {selectedOrder?.email && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium text-gray-900">{selectedOrder.email}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Shipping Address */}
                            {selectedOrder?.shippingAddress && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Địa chỉ giao hàng
                                    </h4>
                                    <p className="text-gray-700">
                                        {typeof selectedOrder.shippingAddress === 'string'
                                            ? selectedOrder.shippingAddress
                                            : `${selectedOrder.shippingAddress.firstName || ''} ${selectedOrder.shippingAddress.lastName || ''} - ${selectedOrder.shippingAddress.phone || ''}`}
                                    </p>
                                    {typeof selectedOrder.shippingAddress === 'object' && (
                                        <p className="text-gray-700 mt-1">
                                            {`${selectedOrder.shippingAddress.address || ''}, ${selectedOrder.shippingAddress.district || ''}, ${selectedOrder.shippingAddress.city || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',')}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Order Items */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Sản phẩm đã đặt</h4>
                                <div className="space-y-3">
                                    {orderDetails.items && orderDetails.items.length > 0 ? (
                                        orderDetails.items.map((item, index) => (
                                            <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                {/* Product Image */}
                                                <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {item.product?.images?.[0] || item.product?.image ? (
                                                        <img
                                                            src={item.product.images?.[0] || item.product.image}
                                                            alt={item.product.name || 'Sản phẩm'}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.parentElement.innerHTML = `
                                                                    <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                `;
                                                            }}
                                                        />
                                                    ) : (
                                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{item.product?.name || `Sản phẩm #${index + 1}`}</p>
                                                    {item.product?.category && (
                                                        <p className="text-xs text-gray-500 mt-0.5">{item.product.category}</p>
                                                    )}
                                                    <p className="text-sm text-gray-500 mt-1">Số lượng: {item.quantity}</p>
                                                    <p className="text-sm font-medium text-gray-900 mt-1">
                                                        {item.price?.toLocaleString('vi-VN')}₫ x {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">Thành tiền</p>
                                                    <p className="text-lg font-bold text-gray-900">
                                                        {(item.price * item.quantity)?.toLocaleString('vi-VN')}₫
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500 py-4">Không có sản phẩm</p>
                                    )}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="border-t pt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tổng tiền hàng:</span>
                                        <span className="font-medium">{selectedOrder?.totalAmount?.toLocaleString('vi-VN')}₫</span>
                                    </div>
                                    {selectedOrder?.shippingFee > 0 && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>Phí vận chuyển:</span>
                                            <span className="font-medium text-blue-600">+{selectedOrder.shippingFee?.toLocaleString('vi-VN')}₫</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                                        <span>Tổng thanh toán:</span>
                                        <span className="text-red-600">
                                            {((selectedOrder?.totalAmount || 0) + (selectedOrder?.shippingFee || 0)).toLocaleString('vi-VN')}₫
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-between gap-3">
                            <div>
                                {selectedOrder && canCancelOrder(selectedOrder) && (
                                    <button
                                        onClick={() => handleCancelOrder(selectedOrder._id)}
                                        className="px-6 py-2.5 bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors rounded"
                                    >
                                        Hủy đơn hàng
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={closeModal}
                                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors rounded"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Order Confirmation Modal */}
            {showCancelConfirm && (
                <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => {
                    setShowCancelConfirm(false);
                    setOrderToCancel(null);
                }}>
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            {/* Icon */}
                            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                                Xác nhận hủy đơn hàng
                            </h3>

                            {/* Message */}
                            <p className="text-gray-600 text-center mb-6">
                                Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowCancelConfirm(false);
                                        setOrderToCancel(null);
                                    }}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors rounded-lg"
                                >
                                    Không
                                </button>
                                <button
                                    onClick={confirmCancelOrder}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors rounded-lg shadow-md hover:shadow-lg"
                                >
                                    Có, hủy đơn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
