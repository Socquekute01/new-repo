import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import { userAPI, roleAPI } from '../../src/services/api';
import { toast } from 'sonner';

const UserManagement = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [users, setUsers] = useState([]);
    const [setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteUserId, setDeleteUserId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        role: '' // Thay roleIds bằng role (single value)
    });

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getAll();
            setUsers(response.data || response);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users list');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await roleAPI.getAll();
            setRoles(response.data || response);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const openAddModal = () => {
        setEditingUser(null);
        setFormData({
            username: '',
            name: '',
            email: '',
            password: '',
            phone: '',
            address: '',
            role: '' // Mặc định không chọn vai trò
        });
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);

        // Lấy role từ user.role (string) hoặc user.roles[0].name
        let userRole = '';
        if (user.role) {
            userRole = user.role.toLowerCase();
        } else if (user.roles && user.roles.length > 0) {
            userRole = user.roles[0].name.toLowerCase();
        }

        setFormData({
            username: user.username || '',
            name: user.name || '',
            email: user.email || '',
            password: '',
            phone: user.phone || '',
            address: user.address || '',
            role: userRole
        });
        setShowModal(true);
    };

    const openDeleteModal = (userId) => {
        setDeleteUserId(userId);
        setShowDeleteModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Required fields validation
        if (!formData.username || !formData.name || !formData.email) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Username validation (alphanumeric, 3-20 characters)
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(formData.username)) {
            toast.error('Username must be 3-20 characters and contain only letters, numbers, and underscores');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        // Phone validation (if provided)
        if (formData.phone && formData.phone.trim()) {
            const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(formData.phone.replace(/[\s-]/g, ''))) {
                toast.error('Phone number must be 10-11 digits');
                return;
            }
        }

        // Password validation for new users
        if (!editingUser && !formData.password) {
            toast.error('Please enter a password');
            return;
        }

        // Password strength validation (if provided)
        if (formData.password && formData.password.trim()) {
            if (formData.password.length < 6) {
                toast.error('Password must be at least 6 characters');
                return;
            }
        }

        try {
            const userData = {
                username: formData.username,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                role: formData.role || 'user' // Lưu role: "user", "staff", "manager", "admin"
            };

            if (formData.password) {
                userData.password = formData.password;
            }

            if (editingUser) {
                await userAPI.update(editingUser._id, userData);
                toast.success('User updated successfully!');
            } else {
                await userAPI.create(userData);
                toast.success('User created successfully!');
            }

            setShowModal(false);
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            toast.error(error.response?.data?.message || 'Failed to save user');
        }
    };

    const handleDelete = async () => {
        try {
            await userAPI.delete(deleteUserId);
            toast.success('User deleted successfully!');
            setShowDeleteModal(false);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const getRoleNames = (userRoles, fallbackRole) => {
        if (userRoles && userRoles.length > 0) {
            return userRoles.map(r => r.name).join(', ');
        }
        if (fallbackRole) {
            return fallbackRole.charAt(0).toUpperCase() + fallbackRole.slice(1);
        }
        return 'User';
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const userRole = user.role || (user.roles && user.roles.length > 0 ? user.roles[0].name.toLowerCase() : 'user');
        const matchesRole = roleFilter === '' || userRole.toLowerCase() === roleFilter.toLowerCase();

        return matchesSearch && matchesRole;
    });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        switch (sortBy) {
            case 'name-asc':
                return (a.name || '').localeCompare(b.name || '');
            case 'name-desc':
                return (b.name || '').localeCompare(a.name || '');
            case 'email-asc':
                return (a.email || '').localeCompare(b.email || '');
            case 'email-desc':
                return (b.email || '').localeCompare(a.email || '');
            case 'username-asc':
                return (a.username || '').localeCompare(b.username || '');
            case 'username-desc':
                return (b.username || '').localeCompare(a.username || '');
            default:
                return 0;
        }
    });

    return (
        <>
            <div className="flex h-screen overflow-hidden bg-gray-100">
                {/* Sidebar */}
                <aside className={`w-64 bg-indigo-900 text-white flex-shrink-0 flex-col ${sidebarOpen ? 'flex' : 'hidden'} md:flex fixed md:relative h-full z-50`}>
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
                            className="w-full flex items-center px-6 py-3 bg-indigo-800 border-l-4 border-blue-400 text-left"
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
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-y-auto">
                    {/* Header */}
                    <header className="bg-white shadow-sm px-4 md:px-8 py-4 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <button
                                className="md:hidden text-gray-500"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                            >
                                <i className="fas fa-bars text-xl"></i>
                            </button>
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800">User Management</h2>
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
                                <h3 className="font-bold text-gray-700">User List</h3>
                                <button
                                    onClick={openAddModal}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2"
                                >
                                    <i className="fas fa-plus"></i>
                                    <span>Add User</span>
                                </button>
                            </div>

                            {/* Filter Section */}
                            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                        <input
                                            type="text"
                                            placeholder="Search by name, username, email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="">All Roles</option>
                                        <option value="user">User</option>
                                        <option value="staff">Staff</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[150px]"
                                    >
                                        <option value="default">Sort By</option>
                                        <option value="name-asc">Name: A-Z</option>
                                        <option value="name-desc">Name: Z-A</option>
                                        <option value="username-asc">Username: A-Z</option>
                                        <option value="username-desc">Username: Z-A</option>
                                        <option value="email-asc">Email: A-Z</option>
                                        <option value="email-desc">Email: Z-A</option>
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
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Username</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {sortedUsers.map((user) => (
                                                <tr key={user._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm font-medium">{user.username}</td>
                                                    <td className="px-6 py-4 text-sm">{user.name}</td>
                                                    <td className="px-6 py-4 text-sm">{user.email}</td>
                                                    <td className="px-6 py-4 text-sm">{user.phone || '-'}</td>
                                                    <td className="px-6 py-4 text-xs">
                                                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                                                            {getRoleNames(user.roles, user.role)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => openEditModal(user)}
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteModal(user._id)}
                                                                className="text-red-600 hover:text-red-800"
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                >
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingUser ? 'Update User' : 'Add New User'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Username <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password {!editingUser && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder={editingUser ? "Leave blank if no change" : ""}
                                        required={!editingUser}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Role
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="">-- Select role --</option>
                                        <option value="user">User</option>
                                        <option value="staff">Staff</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                >
                                    {editingUser ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                            <p className="text-gray-600 mb-6">Are you sure you want to delete this user?</p>
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
        </>
    );
};

export default UserManagement;
