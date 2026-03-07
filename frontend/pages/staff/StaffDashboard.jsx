import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';

const staffAPI = {
    getStats: async () => {
        const response = await axios.get('http://localhost:5001/api/staff/stats', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },
    getOrders: async (params) => {
        const response = await axios.get('http://localhost:5001/api/staff/orders', {
            params,
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },
    updateOrderStatus: async (id, status) => {
        const response = await axios.put(
            `http://localhost:5001/api/staff/orders/${id}/status`,
            { status },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        return response.data;
    },
    getLowStock: async () => {
        const response = await axios.get('http://localhost:5001/api/staff/products/low-stock', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    }
};

export default function StaffDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, ordersRes, lowStockRes] = await Promise.all([
                staffAPI.getStats(),
                staffAPI.getOrders({ page: 1, limit: 10 }),
                staffAPI.getLowStock()
            ]);

            setStats(statsRes.data);
            setOrders(ordersRes.data.orders);
            setLowStockProducts(lowStockRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await staffAPI.updateOrderStatus(orderId, newStatus);
            toast.success('Order status updated successfully');
            fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.message || 'Failed to update order status');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-700',
            'processing': 'bg-blue-100 text-blue-700',
            'shipping': 'bg-purple-100 text-purple-700',
            'completed': 'bg-green-100 text-green-700',
            'cancelled': 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <aside className={`w-64 bg-gradient-to-b from-teal-700 to-teal-900 text-white flex-shrink-0 flex-col ${isSidebarOpen ? 'flex' : 'hidden'} md:flex fixed md:relative h-full z-50`}>
                <div className="p-6 border-b border-teal-600 flex items-center justify-center">
                    <img
                        src="/picture/logo.png"
                        alt="Logo"
                        className="h-16 w-16 object-cover rounded-full"
                    />
                </div>
                <nav className="flex-1 mt-4">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center px-6 py-3 ${activeTab === 'overview' ? 'bg-teal-600 border-l-4 border-teal-400' : 'hover:bg-teal-700'} transition text-left`}
                    >
                        <i className="fas fa-chart-line mr-3"></i> Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`w-full flex items-center px-6 py-3 ${activeTab === 'orders' ? 'bg-teal-600 border-l-4 border-teal-400' : 'hover:bg-teal-700'} transition text-left`}
                    >
                        <i className="fas fa-shopping-cart mr-3"></i> Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`w-full flex items-center px-6 py-3 ${activeTab === 'products' ? 'bg-teal-600 border-l-4 border-teal-400' : 'hover:bg-teal-700'} transition text-left`}
                    >
                        <i className="fas fa-box mr-3"></i> Low Stock
                    </button>
                </nav>
                <div className="p-4 border-t border-teal-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 rounded transition text-left"
                    >
                        <i className="fas fa-sign-out-alt mr-3"></i> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="md:hidden text-gray-600 hover:text-gray-900"
                    >
                        <i className="fas fa-bars text-2xl"></i>
                    </button>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">Staff Dashboard</h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700 font-medium">{user?.username || 'Staff'}</span>
                        <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
                            {user?.username?.charAt(0).toUpperCase() || 'S'}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-600"></div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && stats && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                        {/* Stats Cards */}
                                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-600 text-sm font-medium">Pending Orders</p>
                                                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingOrders}</h3>
                                                </div>
                                                <div className="bg-yellow-100 p-4 rounded-full">
                                                    <i className="fas fa-clock text-yellow-600 text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-600 text-sm font-medium">Shipping Orders</p>
                                                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.shippingOrders}</h3>
                                                </div>
                                                <div className="bg-purple-100 p-4 rounded-full">
                                                    <i className="fas fa-truck text-purple-600 text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-600 text-sm font-medium">Completed Today</p>
                                                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.completedToday}</h3>
                                                </div>
                                                <div className="bg-green-100 p-4 rounded-full">
                                                    <i className="fas fa-check-circle text-green-600 text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-600 text-sm font-medium">Low Stock Items</p>
                                                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.lowStockProducts}</h3>
                                                </div>
                                                <div className="bg-red-100 p-4 rounded-full">
                                                    <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                                                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</h3>
                                                </div>
                                                <div className="bg-blue-100 p-4 rounded-full">
                                                    <i className="fas fa-shopping-bag text-blue-600 text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-500">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-600 text-sm font-medium">Cancelled Orders</p>
                                                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.cancelledOrders}</h3>
                                                </div>
                                                <div className="bg-gray-100 p-4 rounded-full">
                                                    <i className="fas fa-times-circle text-gray-600 text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Orders Preview */}
                                    <div className="bg-white rounded-xl shadow-md p-6">
                                        <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
                                        <div className="space-y-3">
                                            {orders.slice(0, 5).map((order) => (
                                                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                                    <div>
                                                        <p className="font-medium">#{order._id.slice(-8).toUpperCase()}</p>
                                                        <p className="text-sm text-gray-600">{order.user?.username || 'N/A'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-teal-600">{formatPrice(order.totalAmount)}</p>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('orders')}
                                            className="mt-4 w-full py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
                                        >
                                            View All Orders
                                        </button>
                                    </div>
                                </>
                            )}

                            {activeTab === 'orders' && (
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h3 className="text-lg font-bold mb-4">Manage Orders</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead className="bg-teal-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Order ID</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Customer</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Amount</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {orders.map((order) => (
                                                    <tr key={order._id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm">#{order._id.slice(-8).toUpperCase()}</td>
                                                        <td className="px-4 py-3 text-sm">{order.user?.username || 'N/A'}</td>
                                                        <td className="px-4 py-3 text-sm font-bold text-teal-600">{formatPrice(order.totalAmount)}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {(order.status === 'pending' || order.status === 'processing') ? (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(order._id, 'shipping')}
                                                                    className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                                                                >
                                                                    Ship
                                                                </button>
                                                            ) : order.status === 'shipping' ? (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(order._id, 'completed')}
                                                                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                                                >
                                                                    Complete
                                                                </button>
                                                            ) : (
                                                                <span className="text-xs text-gray-500">No action</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'products' && (
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h3 className="text-lg font-bold mb-4">Low Stock Products</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {lowStockProducts.map((product) => (
                                            <div key={product._id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                                                <h4 className="font-bold text-gray-900">{product.name}</h4>
                                                <p className="text-sm text-gray-600">{product.category?.name || 'N/A'}</p>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <span className="text-lg font-bold text-red-600">Stock: {product.stock}</span>
                                                    <span className="text-sm text-gray-600">{formatPrice(product.price)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
