import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import { managerAPI } from '../../src/services/api';
import { toast } from 'sonner';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function ManagerDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await managerAPI.getStats();
            setDashboardData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
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

    const getMonthName = (month) => {
        const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        return months[month - 1];
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
            'pending': 'Chờ xử lý',
            'paid': 'Đã thanh toán',
            'shipped': 'Đang giao',
            'completed': 'Hoàn thành',
            'cancelled': 'Đã hủy'
        };
        return statusMap[status] || status;
    };

    // Prepare chart data
    const revenueLabels = dashboardData?.monthlyRevenue.map(item =>
        `${getMonthName(item._id.month)} ${item._id.year}`
    ) || [];
    const revenueValues = dashboardData?.monthlyRevenue.map(item => item.revenue) || [];

    // Prepare status chart data
    const statusLabels = dashboardData?.ordersByStatus.map(item => getStatusText(item._id)) || [];
    const statusValues = dashboardData?.ordersByStatus.map(item => item.count) || [];
    const statusColors = dashboardData?.ordersByStatus.map(item => {
        const colorMap = {
            'pending': '#fbbf24',
            'paid': '#3b82f6',
            'shipped': '#a855f7',
            'completed': '#10b981',
            'cancelled': '#ef4444'
        };
        return colorMap[item._id] || '#6b7280';
    }) || [];

    const stats = dashboardData ? [
        {
            title: 'Total Revenue',
            value: formatPrice(dashboardData.totalRevenue),
            color: 'text-green-600'
        },
        {
            title: 'New Orders (30 days)',
            value: dashboardData.newOrdersCount.toString(),
            color: 'text-blue-600'
        },
        {
            title: 'Total Orders',
            value: dashboardData.totalOrders.toString(),
            color: 'text-orange-600'
        },
        {
            title: 'Pending Orders',
            value: dashboardData.pendingOrders.toString(),
            color: 'text-yellow-600'
        }
    ] : [];

    // Revenue Chart Data
    const revenueData = {
        labels: revenueLabels,
        datasets: [
            {
                label: 'Revenue (VND)',
                data: revenueValues,
                borderColor: '#14b8a6',
                backgroundColor: 'rgba(20, 184, 166, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const revenueOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    // Traffic Chart Data (Orders by Status)
    const trafficData = {
        labels: statusLabels,
        datasets: [
            {
                data: statusValues,
                backgroundColor: statusColors,
                hoverOffset: 4,
            },
        ],
    };

    const trafficOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
    };

    if (loading || !dashboardData) {
        return (
            <div className="flex h-screen overflow-hidden bg-gray-100">
                {/* Sidebar */}
                <aside className={`w-64 bg-teal-800 text-white flex-shrink-0 flex-col ${isSidebarOpen ? 'flex' : 'hidden'} md:flex fixed md:relative h-full z-50`}>
                    <div className="p-6 border-b border-teal-700 flex items-center justify-center">
                        <img
                            src="/picture/logo.png"
                            alt="Logo"
                            className="h-16 w-16 object-cover rounded-full"
                        />
                    </div>
                    <nav className="flex-1 mt-4">
                        <button
                            onClick={() => navigate('/manager/dashboard')}
                            className="w-full flex items-center px-6 py-3 bg-teal-700 border-l-4 border-teal-400 text-left"
                        >
                            <i className="fas fa-chart-line mr-3"></i> Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/manager/orders')}
                            className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
                        >
                            <i className="fas fa-shopping-cart mr-3"></i> Orders
                        </button>
                        <button
                            onClick={() => navigate('/manager/products')}
                            className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
                        >
                            <i className="fas fa-box mr-3"></i> Products
                        </button>
                        <button
                            onClick={() => navigate('/manager/categories')}
                            className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
                        >
                            <i className="fas fa-tags mr-3"></i> Categories
                        </button>
                        <button
                            onClick={() => navigate('/manager/reports')}
                            className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
                        >
                            <i className="fas fa-chart-bar mr-3"></i> Reports
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
                        >
                            <i className="fas fa-home mr-3"></i> Home
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left mt-4 border-t border-teal-700"
                        >
                            <i className="fas fa-sign-out-alt mr-3"></i> Logout
                        </button>
                    </nav>
                </aside>

                {/* Main Content with Loading */}
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <aside className={`w-64 bg-teal-800 text-white flex-shrink-0 flex-col ${isSidebarOpen ? 'flex' : 'hidden'} md:flex fixed md:relative h-full z-50`}>
                <div className="p-6 border-b border-teal-700 flex items-center justify-center">
                    <img
                        src="/picture/logo.png"
                        alt="Logo"
                        className="h-16 w-16 object-cover rounded-full"
                    />
                </div>
                <nav className="flex-1 mt-4">
                    <button
                        onClick={() => navigate('/manager/dashboard')}
                        className="w-full flex items-center px-6 py-3 bg-teal-700 border-l-4 border-teal-400 text-left"
                    >
                        <i className="fas fa-chart-line mr-3"></i> Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/manager/orders')}
                        className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
                    >
                        <i className="fas fa-shopping-cart mr-3"></i> Orders
                    </button>
                    <button
                        onClick={() => navigate('/manager/products')}
                        className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
                    >
                        <i className="fas fa-box mr-3"></i> Products
                    </button>
                    <button
                        onClick={() => navigate('/manager/categories')}
                        className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
                    >
                        <i className="fas fa-tags mr-3"></i> Categories
                    </button>
                    <button
                        onClick={() => navigate('/manager/reports')}
                        className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
                    >
                        <i className="fas fa-chart-bar mr-3"></i> Reports
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
                    >
                        <i className="fas fa-home mr-3"></i> Home
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left mt-4 border-t border-teal-700"
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
                        <h2 className="text-lg md:text-xl font-semibold text-gray-800">Manager Dashboard</h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-500 hover:text-teal-600">
                            <i className="fas fa-bell"></i>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
                            {user?.username?.charAt(0).toUpperCase() || 'M'}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-4 md:p-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <p className="text-gray-500 text-sm">{stat.title}</p>
                                <h3 className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</h3>
                            </div>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
                        {/* Revenue Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-700 mb-4">Revenue Last 6 Months</h3>
                            <div className="h-64">
                                <Line data={revenueData} options={revenueOptions} />
                            </div>
                        </div>

                        {/* Traffic Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-700 mb-4">Orders by Status</h3>
                            <div className="max-w-[300px] mx-auto h-64 flex items-center justify-center">
                                <Doughnut data={trafficData} options={trafficOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Top Products Section */}
                    {dashboardData.topProducts && dashboardData.topProducts.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="font-bold text-gray-700">Top Selling Products (30 days)</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {dashboardData.topProducts.map((product, index) => (
                                        <div key={product._id} className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4 hover:shadow-md transition-shadow">
                                            <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                                                <span className="text-teal-700 font-bold text-lg">#{index + 1}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800 line-clamp-1">{product.name}</h4>
                                                <p className="text-sm text-gray-600">
                                                    Sold: <span className="font-semibold text-teal-600">{product.totalQuantity}</span>
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Revenue: <span className="font-semibold">{formatPrice(product.totalRevenue)}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Orders Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">Recent Orders</h3>
                            <button
                                onClick={() => navigate('/manager/orders')}
                                className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                            >
                                View All
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {dashboardData.recentOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-teal-600">
                                                #{order._id.slice(-8).toUpperCase()}
                                            </td>
                                            <td className="px-6 py-4 text-sm">{order.user?.username || order.email || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm font-semibold">{formatPrice(order.totalAmount)}</td>
                                            <td className="px-6 py-4 text-xs">
                                                <span className={`${getStatusColor(order.status)} px-2 py-1 rounded-full`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
