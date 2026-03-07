import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { productAPI } from '../../services/api';
import QuickViewModal from '../QuickViewModal';
import VanillaTilt from 'vanilla-tilt';
import Pagination from '../pagination/Pagination';

export default function Card() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState(new Set());
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const cardRefs = useRef([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 8;

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        // Initialize VanillaTilt for all card elements
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

        // Cleanup function
        return () => {
            cardRefs.current.forEach((card) => {
                if (card?.vanillaTilt) {
                    card.vanillaTilt.destroy();
                }
            });
        };
    }, [products, currentPage]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productAPI.getAll();
            setProducts(data.data || data);
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

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

    // Pagination logic
    const totalPages = Math.ceil(products.length / productsPerPage);
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-lg text-gray-600">Loading products...</div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Products Grid */}
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
                                {/* Collab Label */}
                                <div className="mb-4 flex justify-between items-start"
                                    style={{ transform: 'translateZ(20px)' }}>
                                    {/* <span className="bg-black text-white text-xs font-bold px-3 py-1 shadow-lg">
                                        Collab
                                    </span> */}
                                    {/* <button
                                        onClick={() => toggleFavorite(productId)}
                                        className={`p-2 rounded-full transition-all duration-300 shadow-lg ${favorites.has(product.id)
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        style={{ transform: 'translateZ(20px)' }}
                                    >
                                        <Heart
                                            size={18}
                                            fill={favorites.has(product.id) ? 'currentColor' : 'none'}
                                        />
                                    </button> */}
                                </div>

                                {/* Product Image Container */}
                                <div
                                    onClick={() => navigate(`/product/${productId}`)}
                                    className="relative bg-gray-100 rounded-lg overflow-hidden mb-4 h-80 flex items-center justify-center group cursor-pointer shadow-xl"
                                    style={{ transform: 'translateZ(40px)' }}>
                                    {productImage ? (
                                        <img
                                            src={productImage}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700 ease-out"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                            <ShoppingBag size={48} className="text-gray-400" />
                                        </div>
                                    )}

                                    {/* Hover Overlay with Buttons */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
                                        <div className="flex flex-col gap-3 px-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/product/${productId}`);
                                                }}
                                                className="bg-white text-black font-bold px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm whitespace-nowrap"
                                            >
                                                View Detail
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setQuickViewProduct(product);
                                                }}
                                                className="bg-black text-white border-2 border-white font-bold px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm whitespace-nowrap"
                                            >
                                                Quick View
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Name */}
                                <h3
                                    onClick={() => navigate(`/product/${productId}`)}
                                    className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors"
                                    style={{ transform: 'translateZ(25px)' }}>
                                    {product.name}
                                </h3>

                                {/* Product Price */}
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
                                    <p className="text-red-600 text-sm font-semibold mt-2">Out of Stock</p>
                                )}
                                {product.stock > 0 && product.stock < 5 && (
                                    <p className="text-orange-600 text-sm font-semibold mt-2">
                                        Only {product.stock} left
                                    </p>
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

                {/* Error Message */}
                {error && (
                    <div className="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {/* No Products */}
                {!loading && products.length === 0 && !error && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">No products found</p>
                    </div>
                )}
            </div>

            {/* Quick View Modal */}
            <QuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </div>
    );
}
