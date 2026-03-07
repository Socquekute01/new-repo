import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import { managerAPI } from '../../src/services/api';
import { toast } from 'sonner';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function ManagerReports() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sales');

    // Data states
    const [salesData, setSalesData] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [revenueByCategory, setRevenueByCategory] = useState([]);
    const [customerStats, setCustomerStats] = useState(null);
    const [inventoryData, setInventoryData] = useState(null);

    // Date filter
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchAllReports();
    }, []);

    const fetchAllReports = async () => {
        try {
            setLoading(true);
            const [sales, products, category, customers, inventory] = await Promise.all([
                managerAPI.getSales(startDate, endDate),
                managerAPI.getTopProducts(10),
                managerAPI.getRevenueByCategory(),
                managerAPI.getCustomerStats(),
                managerAPI.getInventory()
            ]);

            setSalesData(sales.data);
            setTopProducts(products.data);
            setRevenueByCategory(category.data);
            setCustomerStats(customers.data);
            setInventoryData(inventory.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to load reports');
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

    const handleFilterSales = async () => {
        if (!startDate || !endDate) {
            toast.error('Please select both start and end dates');
            return;
        }
        try {
            const sales = await managerAPI.getSales(startDate, endDate);
            setSalesData(sales.data);
            toast.success('Sales data filtered successfully');
        } catch (error) {
            toast.error('Failed to filter sales data');
        }
    };

    // Chart data
    const categoryChartData = {
        labels: revenueByCategory?.map(item => item.categoryName) || [],
        datasets: [{
            label: 'Revenue by Category',
            data: revenueByCategory?.map(item => item.totalRevenue) || [],
            backgroundColor: [
                '#0f766e', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4',
                '#ccfbf1', '#f0fdfa', '#0d9488', '#115e59', '#134e4a'
            ],
        }]
    };

    const topProductsChartData = {
        labels: topProducts?.map(item => item.productInfo?.name) || [],
        datasets: [{
            label: 'Units Sold',
            data: topProducts?.map(item => item.totalQuantity) || [],
            backgroundColor: '#0f766e',
        }]
    };

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
                        className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
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
                        className="w-full flex items-center px-6 py-3 bg-teal-700 border-l-4 border-teal-400 text-left"
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
                        <h2 className="text-lg md:text-xl font-semibold text-gray-800">Reports & Analytics</h2>
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
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                        </div>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                                <div className="flex border-b overflow-x-auto">
                                    <button
                                        onClick={() => setActiveTab('sales')}
                                        className={`px-6 py-3 font-medium transition ${activeTab === 'sales'
                                            ? 'border-b-2 border-teal-600 text-teal-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <i className="fas fa-dollar-sign mr-2"></i>
                                        Sales Report
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('products')}
                                        className={`px-6 py-3 font-medium transition ${activeTab === 'products'
                                            ? 'border-b-2 border-teal-600 text-teal-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <i className="fas fa-box mr-2"></i>
                                        Top Products
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('category')}
                                        className={`px-6 py-3 font-medium transition ${activeTab === 'category'
                                            ? 'border-b-2 border-teal-600 text-teal-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <i className="fas fa-tags mr-2"></i>
                                        By Category
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('inventory')}
                                        className={`px-6 py-3 font-medium transition ${activeTab === 'inventory'
                                            ? 'border-b-2 border-teal-600 text-teal-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <i className="fas fa-warehouse mr-2"></i>
                                        Inventory
                                    </button>
                                </div>
                            </div>

                            {/* Sales Report Tab */}
                            {activeTab === 'sales' && salesData && (
                                <div className="space-y-6">
                                    {/* Date Filter */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                        <h3 className="text-lg font-semibold mb-4">Filter by Date Range</h3>
                                        <div className="flex flex-wrap gap-4 items-end">
                                            <div className="flex-1 min-w-[200px]">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-[200px]">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <button
                                                    onClick={handleFilterSales}
                                                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                                                >
                                                    Apply Filter
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                            <p className="text-gray-500 text-sm">Total Sales</p>
                                            <h3 className="text-2xl font-bold text-green-600 mt-1">
                                                {formatPrice(salesData.totalRevenue || 0)}
                                            </h3>
                                        </div>
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                            <p className="text-gray-500 text-sm">Total Orders</p>
                                            <h3 className="text-2xl font-bold text-blue-600 mt-1">
                                                {salesData.totalOrders || 0}
                                            </h3>
                                        </div>
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                            <p className="text-gray-500 text-sm">Average Order Value</p>
                                            <h3 className="text-2xl font-bold text-teal-600 mt-1">
                                                {formatPrice(salesData.averageOrderValue || 0)}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Top Products Tab */}
                            {activeTab === 'products' && (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                        <h3 className="font-bold text-gray-700 mb-4">Top 10 Best Selling Products</h3>
                                        <div className="h-96">
                                            <Bar
                                                data={topProductsChartData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    indexAxis: 'y',
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                                        <div className="p-6 border-b">
                                            <h3 className="font-bold text-gray-700">Product Details</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Units Sold</th>
                                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {topProducts && topProducts.length > 0 ? (
                                                        topProducts.map((product, index) => (
                                                            <tr key={index} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 text-sm font-medium">{product.productInfo?.name || 'N/A'}</td>
                                                                <td className="px-6 py-4 text-sm">{product.totalQuantity || 0}</td>
                                                                <td className="px-6 py-4 text-sm font-semibold text-green-600">
                                                                    {formatPrice(product.totalRevenue || 0)}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                                                No product data available
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Category Tab */}
                            {activeTab === 'category' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                            <h3 className="font-bold text-gray-700 mb-4">Revenue Distribution</h3>
                                            <div className="max-w-[400px] mx-auto">
                                                <Pie data={categoryChartData} />
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                                            <div className="p-6 border-b">
                                                <h3 className="font-bold text-gray-700">Category Breakdown</h3>
                                            </div>
                                            <div className="p-6">
                                                {revenueByCategory && revenueByCategory.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {revenueByCategory.map((category, index) => (
                                                            <div key={index} className="flex justify-between items-center">
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{category.categoryName || 'N/A'}</p>
                                                                </div>
                                                                <p className="text-lg font-bold text-teal-600">
                                                                    {formatPrice(category.totalRevenue || 0)}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-center text-gray-500 py-8">No category data available</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Inventory Tab */}
                            {activeTab === 'inventory' && inventoryData && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                            <p className="text-gray-500 text-sm">Total Products</p>
                                            <h3 className="text-2xl font-bold text-blue-600 mt-1">
                                                {inventoryData.totalProducts || 0}
                                            </h3>
                                        </div>
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                            <p className="text-gray-500 text-sm">Low Stock Items</p>
                                            <h3 className="text-2xl font-bold text-yellow-600 mt-1">
                                                {inventoryData.lowStockProducts || 0}
                                            </h3>
                                        </div>
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                            <p className="text-gray-500 text-sm">Out of Stock</p>
                                            <h3 className="text-2xl font-bold text-red-600 mt-1">
                                                {inventoryData.outOfStockProducts || 0}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Low Stock Products Table */}
                                    {inventoryData.lowStockList && inventoryData.lowStockList.length > 0 && (
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                                            <div className="p-6 border-b">
                                                <h3 className="font-bold text-gray-700">Low Stock Products (Need Restock)</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Current Stock</th>
                                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {inventoryData.lowStockList.map((product, index) => (
                                                            <tr key={index} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 font-medium">{product.name}</td>
                                                                <td className="px-6 py-4">{product.stock}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.stock === 0
                                                                        ? 'bg-red-100 text-red-700'
                                                                        : 'bg-yellow-100 text-yellow-700'
                                                                        }`}>
                                                                        {product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
