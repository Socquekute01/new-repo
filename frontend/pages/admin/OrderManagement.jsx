import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import { orderAPI } from '../../src/services/api';
import { toast } from 'sonner';

export default function OrderManagement() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderAPI.getAll();
            setOrders(response.data || response);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-700',
            'paid': 'bg-blue-100 text-blue-700',
            'shipped': 'bg-purple-100 text-purple-700',
            'completed': 'bg-green-100 text-green-700',
            'cancelled': 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'Pending',
            'paid': 'Paid',
            'shipped': 'Shipped',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    };

    const openDetailModal = async (order) => {
        try {
            const response = await orderAPI.getById(order._id);
            setSelectedOrder(response);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Failed to load order details');
        }
    };

    const openEditModal = (order) => {
        setEditingOrder(order);
        setNewStatus(order.status);
        setShowEditModal(true);
    };

    const openDeleteModal = (order) => {
        setEditingOrder(order);
        setShowDeleteModal(true);
    };

    const handleUpdateStatus = async () => {
        try {
            await orderAPI.update(editingOrder._id, { status: newStatus });
            toast.success('Order status updated successfully');
            setShowEditModal(false);
            fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order status');
        }
    };

    const handleDeleteOrder = async () => {
        try {
            await orderAPI.delete(editingOrder._id);
            toast.success('Order deleted successfully');
            setShowDeleteModal(false);
            fetchOrders();
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error('Failed to delete order');
        }
    };

    // Filter and sort orders
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shippingAddress?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shippingAddress?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shippingAddress?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shippingAddress?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shippingAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = !statusFilter || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const sortedOrders = [...filteredOrders].sort((a, b) => {
        switch (sortBy) {
            case 'date-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'date-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'total-desc':
                return b.totalAmount - a.totalAmount;
            case 'total-asc':
                return a.totalAmount - b.totalAmount;
            default:
                return 0;
        }
    });

    return (
        <>
            <div className="flex h-screen overflow-hidden bg-gray-100">
                {/* Sidebar */}
                <aside className={`w-64 bg-indigo-900 text-white flex-shrink-0 flex-col ${isSidebarOpen ? 'flex' : 'hidden'} md:flex fixed md:relative h-full z-50`}>
                    <div className="p-6 border-b border-indigo-800 flex items-center justify-center">
                        <img
                            src="/picture/logo.png"
                            alt="Logo"
                            className="h-16 w-16 object-cover rounded-full"
                        />
                    </div>
                    <nav className="flex-1 mt-4">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="w-full flex items-center px-6 py-3 hover:bg-indigo-800 transition text-left"
                        >
                            <i className="fas fa-chart-line mr-3"></i> Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="w-full flex items-center px-6 py-3 hover:bg-indigo-800 transition text-left"
                        >
                            <i className="fas fa-users mr-3"></i> Users
                        </button>
                        <button
                            onClick={() => navigate('/admin/products')}
                            className="w-full flex items-center px-6 py-3 hover:bg-indigo-800 transition text-left"
                        >
                            <i className="fas fa-box mr-3"></i> Products
                        </button>
                        <button
                            onClick={() => navigate('/admin/categories')}
                            className="w-full flex items-center px-6 py-3 hover:bg-indigo-800 transition text-left"
                        >
                            <i className="fas fa-tags mr-3"></i> Categories
                        </button>
                        <button
                            onClick={() => navigate('/admin/orders')}
                            className="w-full flex items-center px-6 py-3 bg-indigo-800 border-l-4 border-blue-400 text-left"
                        >
                            <i className="fas fa-shopping-cart mr-3"></i> Orders
                        </button>
                    <button
                        onClick={() => navigate('/admin/reports')}
                        className="w-full flex items-center px-6 py-3 hover:bg-indigo-800 transition text-left"
                    >
                        <i className="fas fa-file-alt mr-3"></i> Reports
                    </button>
                    <button
                        onClick={() => navigate('/admin/ai-behavior-logs')}
                        className="w-full flex items-center px-6 py-3 hover:bg-indigo-800 transition text-left"
                    >
                        <i className="fas fa-robot mr-3"></i> AI Behavior Logs
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center px-6 py-3 hover:bg-indigo-800 transition text-left"
                    >
                        <i className="fas fa-home mr-3"></i> Home
                    </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-6 py-3 hover:bg-indigo-800 transition text-left mt-4 border-t border-indigo-800"
                        >
                            <i className="fas fa-sign-out-alt mr-3"></i> Logout
                        </button>
                    </nav>
                </aside>

                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-y-auto">
                    {/* Header */}
                    <header className="bg-white shadow-sm px-4 md:px-8 py-4 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <button
                                className="md:hidden text-gray-500"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            >
                                <i className="fas fa-bars text-xl"></i>
                            </button>
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Order Management</h2>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="text-gray-500 hover:text-indigo-600">
                                <i className="fas fa-bell"></i>
                            </button>
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                                {user?.username?.charAt(0).toUpperCase() || 'A'}
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="p-4 md:p-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-gray-700">Order List</h3>
                            </div>

                            {/* Filter Section */}
                            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                        <input
                                            type="text"
                                            placeholder="Search by order ID, email, address..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[150px]"
                                    >
                                        <option value="default">Sort By</option>
                                        <option value="date-desc">Date: Newest First</option>
                                        <option value="date-asc">Date: Oldest First</option>
                                        <option value="total-desc">Total: High to Low</option>
                                        <option value="total-asc">Total: Low to High</option>
                                    </select>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {sortedOrders.map((order) => (
                                                <tr key={order._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                                                        #{order._id.slice(-8).toUpperCase()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">{order.email}</td>
                                                    <td className="px-6 py-4 text-sm font-semibold">{formatPrice(order.totalAmount)}</td>
                                                    <td className="px-6 py-4 text-xs">
                                                        <span className={`${getStatusColor(order.status)} px-2 py-1 rounded-full`}>
                                                            {getStatusText(order.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">{formatDate(order.createdAt)}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <div className="flex space-x-3">
                                                            <button
                                                                onClick={() => openDetailModal(order)}
                                                                className="text-blue-600 hover:text-blue-800"
                                                                title="View Details"
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => openEditModal(order)}
                                                                className="text-green-600 hover:text-green-800"
                                                                title="Edit Status"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteModal(order)}
                                                                className="text-red-600 hover:text-red-800"
                                                                title="Delete Order"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Order Detail Modal */}
            {showDetailModal && selectedOrder && (
                <div
                    className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
                >
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-900">
                                Order Details - #{selectedOrder.order?._id.slice(-8).toUpperCase()}
                            </h3>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Customer Email</label>
                                    <p className="text-gray-900">{selectedOrder.order?.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Order Date</label>
                                    <p className="text-gray-900">{formatDate(selectedOrder.order?.createdAt)}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-700">Shipping Address</label>
                                    <p className="text-gray-900">
                                        {selectedOrder.order?.shippingAddress ? (
                                            typeof selectedOrder.order.shippingAddress === 'string' ?
                                                selectedOrder.order.shippingAddress :
                                                `${selectedOrder.order.shippingAddress.firstName || ''} ${selectedOrder.order.shippingAddress.lastName || ''}, ${selectedOrder.order.shippingAddress.phone || ''}, ${selectedOrder.order.shippingAddress.address || ''}, ${selectedOrder.order.shippingAddress.district || ''}, ${selectedOrder.order.shippingAddress.city || ''}`
                                        ) : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Payment Method</label>
                                    <p className="text-gray-900">
                                        {selectedOrder.order?.paymentMethod === 'vnpay' ? 'VNPay' :
                                            selectedOrder.order?.paymentMethod === 'cod' ? 'COD (Cash on Delivery)' :
                                                'Not Specified'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <p>
                                        <span className={`${getStatusColor(selectedOrder.order?.status)} px-2 py-1 rounded-full text-xs`}>
                                            {getStatusText(selectedOrder.order?.status)}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Product</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Price</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Quantity</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {selectedOrder.items?.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-3 text-sm">{item.product?.name || 'N/A'}</td>
                                                    <td className="px-4 py-3 text-sm">{formatPrice(item.price)}</td>
                                                    <td className="px-4 py-3 text-sm">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-sm font-semibold">{formatPrice(item.price * item.quantity)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                                    <span className="text-2xl font-bold text-indigo-600">{formatPrice(selectedOrder.order?.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 p-6 border-t">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Status Modal */}
            {showEditModal && editingOrder && (
                <div
                    className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
                >
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-900">Edit Order Status</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Order ID
                                </label>
                                <p className="text-gray-900 font-semibold">
                                    #{editingOrder._id.slice(-8).toUpperCase()}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Email
                                </label>
                                <p className="text-gray-900">{editingOrder.email}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Status
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 p-6 border-t">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateStatus}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && editingOrder && (
                <div
                    className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
                >
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                                Delete Order
                            </h3>
                            <p className="text-gray-600 text-center mb-6">
                                Are you sure you want to delete order <strong>#{editingOrder._id.slice(-8).toUpperCase()}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteOrder}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    Delete Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
