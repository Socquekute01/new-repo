import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import { aiBehaviorLogAPI } from '../../src/services/api';
import { toast } from 'sonner';

export default function AIBehaviorLogs() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [flowFilter, setFlowFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [userIdFilter, setUserIdFilter] = useState('');
    const [limit, setLimit] = useState(50);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLogId, setDeleteLogId] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const buildParams = (overrides = {}) => {
        const params = {
            flow: flowFilter,
            action: actionFilter,
            userId: userIdFilter,
            limit,
            ...overrides,
        };
        Object.keys(params).forEach((key) => {
            if (params[key] === undefined || params[key] === '') {
                delete params[key];
            }
        });
        return params;
    };

    const fetchLogs = async (overrides = {}) => {
        try {
            setLoading(true);
            const response = await aiBehaviorLogAPI.getAll(buildParams(overrides));
            const payload = response?.data ?? response;
            const data = Array.isArray(payload) ? payload : payload?.data;
            setLogs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching AI behavior logs:', error);
            toast.error('Failed to load AI behavior logs');
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = () => {
        fetchLogs();
    };

    const handleClearFilters = () => {
        setFlowFilter('');
        setActionFilter('');
        setUserIdFilter('');
        setLimit(50);
        setSearchTerm('');
        fetchLogs({ flow: '', action: '', userId: '', limit: 50 });
    };

    const openDeleteModal = (logId) => {
        setDeleteLogId(logId);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!deleteLogId) return;
        try {
            await aiBehaviorLogAPI.delete(deleteLogId);
            toast.success('Log deleted successfully');
            setShowDeleteModal(false);
            setDeleteLogId(null);
            fetchLogs();
        } catch (error) {
            console.error('Error deleting log:', error);
            toast.error('Failed to delete log');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatDateTime = (value) => {
        if (!value) return '-';
        try {
            return new Date(value).toLocaleString('vi-VN');
        } catch {
            return value;
        }
    };

    const formatMetadata = (metadata) => {
        if (!metadata) return '-';
        try {
            return JSON.stringify(metadata);
        } catch {
            return String(metadata);
        }
    };

    const formatProductIds = (productIds) => {
        if (!Array.isArray(productIds) || productIds.length === 0) return '-';
        const preview = productIds.slice(0, 3).map((id) => String(id));
        const remaining = productIds.length - preview.length;
        return remaining > 0 ? `${preview.join(', ')} +${remaining}` : preview.join(', ');
    };

    const resolveUserId = (value) => {
        if (!value) return '-';
        if (typeof value === 'string') return value;
        return value?._id || value?.id || '-';
    };

    const filteredLogs = logs.filter((log) => {
        if (!searchTerm.trim()) return true;
        const keyword = searchTerm.toLowerCase();
        const message = String(log?.message || '').toLowerCase();
        const action = String(log?.action || '').toLowerCase();
        const flow = String(log?.flow || '').toLowerCase();
        const userId = String(resolveUserId(log?.user)).toLowerCase();
        const metadata = String(formatMetadata(log?.metadata)).toLowerCase();
        return (
            message.includes(keyword) ||
            action.includes(keyword) ||
            flow.includes(keyword) ||
            userId.includes(keyword) ||
            metadata.includes(keyword)
        );
    });

    return (
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
                        className="w-full flex items-center px-6 py-3 hover:bg-indigo-800 transition text-left"
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
                        className="w-full flex items-center px-6 py-3 bg-indigo-800 border-l-4 border-blue-400 text-left"
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
                        <h2 className="text-lg md:text-xl font-semibold text-gray-800">AI Behavior Logs</h2>
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
                            <h3 className="font-bold text-gray-700">Behavior Log List</h3>
                            <button
                                onClick={fetchLogs}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2"
                            >
                                <i className="fas fa-sync-alt"></i>
                                <span>Refresh</span>
                            </button>
                        </div>

                        {/* Filter Section */}
                        <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                        <input
                                            type="text"
                                            placeholder="Search by message, action, flow, userId..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 flex-wrap">
                                    <select
                                        value={flowFilter}
                                        onChange={(e) => setFlowFilter(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="">All Flows</option>
                                        <option value="chatbot">Chatbot</option>
                                        <option value="recommendation">Recommendation</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={actionFilter}
                                        onChange={(e) => setActionFilter(e.target.value)}
                                        placeholder="Action"
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                    <input
                                        type="text"
                                        value={userIdFilter}
                                        onChange={(e) => setUserIdFilter(e.target.value)}
                                        placeholder="User ID"
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                    <input
                                        type="number"
                                        min="1"
                                        max="200"
                                        value={limit}
                                        onChange={(e) => setLimit(Number(e.target.value))}
                                        className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Limit"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleApplyFilters}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                >
                                    Apply Filters
                                </button>
                                <button
                                    onClick={handleClearFilters}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Clear
                                </button>
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
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Time</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Flow</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Message</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Products</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Metadata</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredLogs.map((log) => (
                                            <tr key={log._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    {formatDateTime(log.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium">
                                                    <span className="text-gray-700">{resolveUserId(log.user)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold">
                                                        {log.flow || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">{log.action || '-'}</td>
                                                <td className="px-6 py-4 text-sm max-w-[220px] truncate" title={log.message}>
                                                    {log.message || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm max-w-[180px] truncate" title={formatProductIds(log.productIds)}>
                                                    {formatProductIds(log.productIds)}
                                                </td>
                                                <td className="px-6 py-4 text-sm max-w-[260px] truncate" title={formatMetadata(log.metadata)}>
                                                    {formatMetadata(log.metadata)}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <button
                                                        onClick={() => openDeleteModal(log._id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredLogs.length === 0 && (
                                            <tr>
                                                <td className="px-6 py-6 text-sm text-gray-500" colSpan="8">
                                                    No logs found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                >
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="text-center">
                            <i className="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
                            <h3 className="text-xl font-semibold mb-2">Confirm Delete</h3>
                            <p className="text-gray-600 mb-6">Are you sure you want to delete this log?</p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
