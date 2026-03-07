import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import { managerAPI, categoryAPI } from '../../src/services/api';
import { toast } from 'sonner';

export default function ManagerProducts() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [priceFilter, setPriceFilter] = useState('all');
    const [sortBy, setSortBy] = useState('default');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteProductId, setDeleteProductId] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        images: [''],
        size: []
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await managerAPI.getProducts({});
            setProducts(response.data.products || response.data || response);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAll();
            setCategories(response.data || response);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch =
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const productCategory = product.category?._id || product.category;
        const matchesCategory = categoryFilter === '' || productCategory === categoryFilter;

        // Price filter
        let matchesPrice = true;
        if (priceFilter !== 'all') {
            const price = product.price;
            switch (priceFilter) {
                case '0-300':
                    matchesPrice = price < 300000;
                    break;
                case '300-500':
                    matchesPrice = price >= 300000 && price < 500000;
                    break;
                case '500-1000':
                    matchesPrice = price >= 500000 && price < 1000000;
                    break;
                case '1000+':
                    matchesPrice = price >= 1000000;
                    break;
                default:
                    matchesPrice = true;
            }
        }

        return matchesSearch && matchesCategory && matchesPrice;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'stock-asc':
                return a.stock - b.stock;
            case 'stock-desc':
                return b.stock - a.stock;
            default:
                return 0;
        }
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSizeChange = (size) => {
        const currentSizes = formData.size || [];
        if (currentSizes.includes(size)) {
            setFormData(prev => ({
                ...prev,
                size: currentSizes.filter(s => s !== size)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                size: [...currentSizes, size]
            }));
        }
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({
            ...prev,
            images: newImages
        }));
    };

    const addImageField = () => {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, '']
        }));
    };

    const removeImageField = (index) => {
        if (formData.images.length > 1) {
            const newImages = formData.images.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                images: newImages
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Product name is required');
            return;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            toast.error('Price must be greater than 0');
            return;
        }
        if (!formData.stock || parseInt(formData.stock) < 0) {
            toast.error('Stock cannot be negative');
            return;
        }
        if (!formData.category) {
            toast.error('Please select a category');
            return;
        }
        if (!formData.size || formData.size.length === 0) {
            toast.error('Please select at least one size');
            return;
        }

        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                images: formData.images.filter(img => img.trim()),
                size: Array.isArray(formData.size) ? formData.size : []
            };

            if (editingProduct) {
                await managerAPI.updateProduct(editingProduct._id, productData);
                toast.success('Product updated successfully!');
            } else {
                await managerAPI.createProduct(productData);
                toast.success('Product added successfully!');
            }

            setShowModal(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error(error.response?.data?.message || 'Error occurred!');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            category: product.category?._id || product.category,
            stock: product.stock.toString(),
            images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [''],
            size: Array.isArray(product.size) ? product.size : []
        });
        setShowModal(true);
    };

    const openDeleteModal = (productId) => {
        setDeleteProductId(productId);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!deleteProductId) return;

        try {
            await managerAPI.deleteProduct(deleteProductId);
            toast.success('Product deleted successfully!');
            fetchProducts();
            setShowDeleteModal(false);
            setDeleteProductId(null);
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product!');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            stock: '',
            images: [''],
            size: []
        });
        setEditingProduct(null);
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
                        className="w-full flex items-center px-6 py-3 bg-teal-700 border-l-4 border-teal-400 text-left"
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
                        <h2 className="text-lg md:text-xl font-semibold text-gray-800">Product Management</h2>
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">Product List</h3>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowModal(true);
                                }}
                                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition flex items-center space-x-2"
                            >
                                <i className="fas fa-plus"></i>
                                <span>Add Product</span>
                            </button>
                        </div>

                        {/* Filter Section */}
                        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                    <input
                                        type="text"
                                        placeholder="Search products by name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <select
                                    value={priceFilter}
                                    onChange={(e) => setPriceFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                >
                                    <option value="all">All Prices</option>
                                    <option value="0-300">Under 300.000đ</option>
                                    <option value="300-500">300.000đ - 500.000đ</option>
                                    <option value="500-1000">500.000đ - 1.000.000đ</option>
                                    <option value="1000+">Over 1.000.000đ</option>
                                </select>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent min-w-[150px]"
                                >
                                    <option value="default">Sort By</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="name-asc">Name: A-Z</option>
                                    <option value="name-desc">Name: Z-A</option>
                                    <option value="stock-asc">Stock: Low to High</option>
                                    <option value="stock-desc">Stock: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Image</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Product Name</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {sortedProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                    <i className="fas fa-box-open text-4xl mb-4 text-gray-300 block"></i>
                                                    <p>No products found</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            sortedProducts.map((product) => (
                                                <tr key={product._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <img
                                                            src={product.images?.[0] || '/placeholder.png'}
                                                            alt={product.name}
                                                            className="w-16 h-16 object-cover rounded"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium">{product.name}</td>
                                                    <td className="px-6 py-4 text-sm">{formatPrice(product.price)}</td>
                                                    <td className="px-6 py-4 text-sm">{product.stock}</td>
                                                    <td className="px-6 py-4 text-sm">{product.category?.name || 'N/A'}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        {product.stock <= 0 ? (
                                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                                                Out of Stock
                                                            </span>
                                                        ) : product.stock < 10 ? (
                                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                                                Low Stock
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                                In Stock
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleEdit(product)}
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteModal(product._id)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                >
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingProduct ? 'Update Product' : 'Add New Product'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Images *
                                </label>
                                <div className="space-y-3">
                                    {formData.images.map((image, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <input
                                                    type="url"
                                                    value={image}
                                                    onChange={(e) => handleImageChange(index, e.target.value)}
                                                    placeholder="https://example.com/image.jpg"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                />
                                            </div>
                                            {image && (
                                                <div className="w-20 h-20 border border-gray-300 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={image}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {formData.images.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeImageField(index)}
                                                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addImageField}
                                        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-teal-500 hover:text-teal-600 transition flex items-center justify-center gap-2"
                                    >
                                        <i className="fas fa-plus"></i>
                                        Add Another Image
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sizes (Click to select multiple)
                                </label>
                                <div className="flex flex-wrap gap-2 p-4 border border-gray-300 rounded-lg min-h-[60px]">
                                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => handleSizeChange(size)}
                                            className={`px-4 py-2 rounded-lg font-medium transition ${formData.size?.includes(size)
                                                ? 'bg-teal-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                                >
                                    {editingProduct ? 'Update' : 'Add'}
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
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
                >
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="text-center">
                            <i className="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
                            <h3 className="text-xl font-semibold mb-2">Confirm Delete</h3>
                            <p className="text-gray-600 mb-6">Are you sure you want to delete this product?</p>
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
