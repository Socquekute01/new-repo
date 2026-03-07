import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Heart } from 'lucide-react';
import VanillaTilt from 'vanilla-tilt';
import { productAPI, categoryAPI } from '../../src/services/api';
import Header from '../../src/components/header/Header';
import Footer from '../../src/components/footer/Footer';
import QuickViewModal from '../../src/components/QuickViewModal';
import Pagination from '../../src/components/pagination/Pagination';

export default function Shop() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState(new Set());
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const cardRefs = useRef([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 8;

    // Filter states
    const [filters, setFilters] = useState({
        priceRange: 'all',
        category: 'all',
        size: 'all',
        color: 'all',
    });
    const [sortBy, setSortBy] = useState('default');

    useEffect(() => {
        const search = searchParams.get('search');
        if (search) {
            setSearchQuery(search);
        } else {
            setSearchQuery(''); // Clear search query when no search param
        }
        fetchProducts();
        fetchCategories();
    }, [searchParams]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productAPI.getAll();
            setProducts(data.data || data);
        } catch (err) {
            console.error('Error fetching products:', err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await categoryAPI.getAll();
            setCategories(data.data || data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    useEffect(() => {
        // Initialize VanillaTilt for all card elements
        const timer = setTimeout(() => {
            cardRefs.current.forEach((card) => {
                if (card && !card.vanillaTilt) {
                    VanillaTilt.init(card, {
                        max: 25,
                        speed: 3000,
                        glare: true,
                        'max-glare': 0.25,
                        perspective: 1400,
                        scale: 1.03,
                        easing: 'cubic-bezier(0.03, 0.98, 0.52, 0.99)',
                        transition: true,
                    });
                }
            });
        }, 100);

        // Cleanup function
        return () => {
            clearTimeout(timer);
            cardRefs.current.forEach((card) => {
                if (card?.vanillaTilt) {
                    card.vanillaTilt.destroy();
                }
            });
        };
    }, [products, filters, sortBy, currentPage]);

    const toggleFavorite = (productId) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(productId)) {
            newFavorites.delete(productId);
        } else {
            newFavorites.add(productId);
        }
        setFavorites(newFavorites);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const normalizeSizes = (sizeField) => {
        if (!sizeField) return [];
        if (Array.isArray(sizeField)) {
            return sizeField
                .map((s) => (typeof s === 'string' ? s.trim() : ''))
                .filter((s) => s);
        }
        if (typeof sizeField === 'string') {
            return sizeField.split(/[,\s]+/).map((s) => s.trim()).filter((s) => s);
        }
        return [];
    };

    const handleFilterChange = (filterName, value) => {
        setFilters((prev) => ({
            ...prev,
            [filterName]: value,
        }));
        setCurrentPage(1); // Reset về trang 1 khi thay đổi filter
    };

    // Get unique sizes from all products
    const availableSizes = [...new Set(
        products
            .filter(p => p.size)
            .flatMap(p => normalizeSizes(p.size))
            .filter(s => s)
    )].sort();

    const filteredProducts = products.filter((product) => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchName = product.name.toLowerCase().includes(query);
            const matchDescription = product.description?.toLowerCase().includes(query);
            if (!matchName && !matchDescription) return false;
        }

        // Price range filter
        if (filters.priceRange !== 'all') {
            const price = product.price;
            switch (filters.priceRange) {
                case '0-300':
                    if (price >= 300000) return false;
                    break;
                case '300-500':
                    if (price < 300000 || price >= 500000) return false;
                    break;
                case '500-1000':
                    if (price < 500000 || price >= 1000000) return false;
                    break;
                case '1000+':
                    if (price < 1000000) return false;
                    break;
            }
        }

        // Category filter
        if (filters.category !== 'all') {
            const productCategory = product.category?._id || product.category;
            if (productCategory !== filters.category) return false;
        }

        // Size filter
        if (filters.size !== 'all') {
            const sizes = normalizeSizes(product.size).map((s) => s.toLowerCase());
            if (sizes.length === 0) return false;
            if (!sizes.includes(filters.size.toLowerCase())) return false;
        }

        // Color filter (assuming color is in product name or description)
        if (filters.color !== 'all') {
            const searchText = `${product.name} ${product.description || ''}`.toLowerCase();
            if (!searchText.includes(filters.color.toLowerCase())) return false;
        }

        return true;
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
            default:
                return 0;
        }
    });

    // Pagination logic
    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="bg-white min-h-screen">
            <Header />

            {/* Banner Section */}
            <div className="relative w-full h-64 md:h-96 bg-gray-900 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80"
                        alt="Shop Banner"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center z-20 px-4">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                            {searchQuery ? 'Search Results' : 'SHOP'}
                        </h1>
                        {searchQuery ? (
                            <p className="text-lg text-gray-200">
                                Search: {searchQuery} - {sortedProducts.length} products
                            </p>
                        ) : (
                            <p className="text-lg text-gray-200">
                                Discover Our Latest Collections - {sortedProducts.length} products
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters Bar */}
                <div className="flex flex-wrap gap-4 mb-8 items-center justify-between">
                    {/* Left side filters */}
                    <div className="flex flex-wrap gap-3">
                        {/* Price Range Filter */}
                        <select
                            value={filters.priceRange}
                            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                            className="px-4 py-2 border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
                        >
                            <option value="all">Cost</option>
                            <option value="0-300">Under 300.000đ</option>
                            <option value="300-500">300.000đ - 500.000đ</option>
                            <option value="500-1000">500.000đ - 1.000.000đ</option>
                            <option value="1000+">Over 1.000.000đ</option>
                        </select>

                        {/* Category Filter */}
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="px-4 py-2 border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
                        >
                            <option value="all">Category</option>
                            {categories.map((cat) => (
                                <option key={cat._id || cat.id} value={cat._id || cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>

                        {/* Size Filter */}
                        <select
                            value={filters.size}
                            onChange={(e) => handleFilterChange('size', e.target.value)}
                            className="px-4 py-2 border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
                        >
                            <option value="all">Size</option>
                            {availableSizes.map((size) => (
                                <option key={size} value={size.toLowerCase()}>
                                    {size}
                                </option>
                            ))}
                        </select>

                        {/* Color Filter */}
                        {/* <select
                            value={filters.color}
                            onChange={(e) => handleFilterChange('color', e.target.value)}
                            className="px-4 py-2 border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
                        >
                            <option value="all">Màu sắc</option>
                            <option value="white">White</option>
                            <option value="black">Black</option>
                            <option value="navy">Navy</option>
                            <option value="grey">Grey</option>
                        </select> */}
                    </div>

                    {/* Right side - Sort */}
                    <div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer min-w-[150px]"
                        >
                            <option value="default">Sort by</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="name-asc">Name: A-Z</option>
                            <option value="name-desc">Name: Z-A</option>
                        </select>
                    </div>
                </div>

                {/* Active Filters Display - "Bạn chọn" */}
                {(filters.priceRange !== 'all' || filters.category !== 'all' || filters.size !== 'all' || filters.color !== 'all') && (
                    <div className="mb-8 pb-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-blue-600">You choose</h3>
                            <button
                                onClick={() => setFilters({
                                    priceRange: 'all',
                                    category: 'all',
                                    size: 'all',
                                    color: 'all',
                                })}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                            >
                                Delete All
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {filters.category !== 'all' && (
                                <div className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 text-sm font-medium">
                                    <span>{categories.find(c => (c._id || c.id) === filters.category)?.name || 'Category'}</span>
                                    <button
                                        onClick={() => handleFilterChange('category', 'all')}
                                        className="hover:bg-blue-600 rounded-full p-0.5 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {filters.priceRange !== 'all' && (
                                <div className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 text-sm font-medium">
                                    <span>
                                        {filters.priceRange === '0-300' && 'Dưới 300K'}
                                        {filters.priceRange === '300-500' && '300K-500K'}
                                        {filters.priceRange === '500-1000' && '500K-1M'}
                                        {filters.priceRange === '1000+' && 'Trên 1M'}
                                    </span>
                                    <button
                                        onClick={() => handleFilterChange('priceRange', 'all')}
                                        className="hover:bg-blue-600 rounded-full p-0.5 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {filters.size !== 'all' && (
                                <div className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 text-sm font-medium">
                                    <span>SIZE {filters.size.toUpperCase()}</span>
                                    <button
                                        onClick={() => handleFilterChange('size', 'all')}
                                        className="hover:bg-blue-600 rounded-full p-0.5 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {filters.color !== 'all' && (
                                <div className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 text-sm font-medium">
                                    <span>{filters.color.toUpperCase()}</span>
                                    <button
                                        onClick={() => handleFilterChange('color', 'all')}
                                        className="hover:bg-blue-600 rounded-full p-0.5 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg text-gray-600">Loading products...</div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {currentProducts.map((product, index) => {
                                const productId = product._id || product.id;
                                const productImage = product.images?.[0] || product.image;
                                return (
                                    <div
                                        key={productId}
                                        ref={(el) => (cardRefs.current[index] = el)}
                                        className="group transform-gpu transition-all duration-300"
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        {/* Collab Label and Heart */}
                                        {/* <div className="mb-4 flex justify-between items-start" style={{ transform: 'translateZ(20px)' }}>
                                        <span className="bg-black text-white text-xs font-bold px-3 py-1 shadow-lg">
                                            Collab
                                        </span>
                                        <button
                                            onClick={() => toggleFavorite(productId)}
                                            className={`p-2 rounded-full transition-all duration-300 shadow-lg ${favorites.has(productId)
                                                ? 'bg-red-500 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            style={{ transform: 'translateZ(20px)' }}
                                        >
                                            <Heart
                                                size={18}
                                                fill={favorites.has(productId) ? 'currentColor' : 'none'}
                                            />
                                        </button>
                                    </div> */}

                                        {/* Product Image */}
                                        <div
                                            onClick={() => navigate(`/product/${productId}`)}
                                            className="relative bg-gray-100 rounded-lg overflow-hidden mb-4 h-80 flex items-center justify-center group cursor-pointer shadow-xl"
                                            style={{ transform: 'translateZ(40px)' }}
                                        >
                                            {productImage ? (
                                                <img
                                                    src={productImage}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700 ease-out"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                                            )}

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <div className="flex flex-col gap-3 px-4">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/product/${productId}`);
                                                        }}
                                                        className="bg-white text-black font-bold px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                                    >
                                                        View Detail
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setQuickViewProduct(product);
                                                        }}
                                                        className="bg-black text-white border-2 border-white font-bold px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                                                    >
                                                        Quick View
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <h3
                                            onClick={() => navigate(`/product/${productId}`)}
                                            className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors"
                                            style={{ transform: 'translateZ(25px)' }}
                                        >
                                            {product.name}
                                        </h3>

                                        <div className="flex items-center gap-2" style={{ transform: 'translateZ(25px)' }}>
                                            <p className="text-lg font-bold text-gray-900">
                                                {formatPrice(product.price)}
                                            </p>
                                            {product.originalPrice && product.originalPrice > product.price && (
                                                <p className="text-sm text-gray-500 line-through">
                                                    {formatPrice(product.originalPrice)}
                                                </p>
                                            )}
                                        </div>

                                        {/* Stock Status */}
                                        {product.stock <= 0 && (
                                            <p className="text-red-600 text-sm font-semibold mt-2">Hết hàng</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}

                {/* No Products */}
                {!loading && sortedProducts.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-gray-600 text-lg">Không tìm thấy sản phẩm</p>
                    </div>
                )}
            </div>

            {/* Quick View Modal */}
            <QuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />

            <Footer />
        </div>
    );
}
