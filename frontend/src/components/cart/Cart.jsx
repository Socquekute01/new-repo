import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { productAPI } from '../../services/api';
import VanillaTilt from 'vanilla-tilt';
import Header from '../header/Header';
import Footer from '../footer/Footer';

export default function Cart() {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
    const { isAuthenticated } = useAuth();
    const [relatedProducts, setRelatedProducts] = useState([]);
    const cardRefs = useRef([]);
    const scrollContainerRef = useRef(null);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -250, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 250, behavior: 'smooth' });
        }
    };

    const fetchRelatedProducts = async () => {
        try {
            const data = await productAPI.getAll({ limit: 6 });
            setRelatedProducts(data.data || data);
        } catch (err) {
            console.error('Error fetching related products:', err);
            setRelatedProducts([]);
        }
    };

    useEffect(() => {
        fetchRelatedProducts();
    }, []);

    useEffect(() => {
        // Initialize VanillaTilt for related product cards
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
    }, [relatedProducts]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleCheckout = () => {
        // Check if user is logged in
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        // Navigate to checkout page
        navigate('/order');
    };

    return (
        <div className="bg-white min-h-screen">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Cart Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-8">CART</h1>

                {cartItems.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-600 text-lg mb-6">Your cart is currently empty</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-black text-white px-8 py-3 font-bold hover:bg-gray-800 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items Table */}
                        <div className="lg:col-span-2">
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                {/* Table Header */}
                                <div className="bg-gray-50 border-b border-gray-200">
                                    <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-medium text-gray-700">
                                        <div className="col-span-6">Product</div>
                                        <div className="col-span-2 text-center">Quantity</div>
                                        <div className="col-span-2 text-center">Total Price</div>
                                        <div className="col-span-2 text-center">Remove</div>
                                    </div>
                                </div>

                                {/* Cart Items */}
                                <div className="divide-y divide-gray-200">
                                    {cartItems.map((item) => {
                                        const productId = item.product._id || item.product.id;
                                        const productImage = item.product.images?.[0] || item.product.image;
                                        return (
                                            <div key={`${productId}-${item.size}`} className="px-6 py-6">
                                                <div className="grid grid-cols-12 gap-4 items-center">
                                                    {/* Product Info */}
                                                    <div className="col-span-6 flex gap-4">
                                                        <div
                                                            onClick={() => navigate(`/product/${productId}`)}
                                                            className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                                                        >
                                                            {productImage ? (
                                                                <img
                                                                    src={productImage}
                                                                    alt={item.product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-200"></div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3
                                                                onClick={() => navigate(`/product/${productId}`)}
                                                                className="font-semibold text-gray-900 mb-1 cursor-pointer hover:text-blue-600"
                                                            >
                                                                {item.product.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">{item.size}</p>
                                                            <p className="text-sm font-semibold text-gray-900 mt-1">
                                                                {formatPrice(item.product.price)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Quantity Controls */}
                                                    <div className="col-span-2 flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(productId, item.size, item.quantity - 1)
                                                            }
                                                            className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors"
                                                        >
                                                            <ChevronLeft size={16} />
                                                        </button>
                                                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(productId, item.size, Math.min(item.product.stock, item.quantity + 1))
                                                            }
                                                            disabled={item.quantity >= item.product.stock}
                                                            className={`w-8 h-8 flex items-center justify-center border border-gray-300 transition-colors ${item.quantity >= item.product.stock
                                                                ? 'cursor-not-allowed opacity-50 bg-gray-100'
                                                                : 'hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            <ChevronRight size={16} />
                                                        </button>
                                                    </div>

                                                    {/* Total Price */}
                                                    <div className="col-span-2 text-center font-semibold text-gray-900">
                                                        {formatPrice(item.product.price * item.quantity)}
                                                    </div>

                                                    {/* Delete Button */}
                                                    <div className="col-span-2 flex justify-center">
                                                        <button
                                                            onClick={() => removeFromCart(productId, item.size)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Cart Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-4">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-300">
                                        <span className="font-medium text-gray-700">Total:</span>
                                        <span className="text-2xl font-bold text-gray-900">
                                            {formatPrice(getCartTotal())}
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        className="w-full bg-black text-white py-4 px-6 font-bold hover:bg-gray-800 transition-colors rounded-lg"
                                    >
                                        CHECKOUT
                                    </button>

                                    <button
                                        onClick={() => navigate('/')}
                                        className="w-full border-2 border-gray-300 text-gray-700 py-3 px-6 font-medium hover:bg-gray-100 transition-colors rounded-lg"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16 relative">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                            Other Products
                        </h2>

                        {/* Navigation Buttons */}
                        <button
                            onClick={scrollLeft}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft size={24} className="text-gray-800" />
                        </button>
                        <button
                            onClick={scrollRight}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
                            aria-label="Scroll right"
                        >
                            <ChevronRight size={24} className="text-gray-800" />
                        </button>

                        <div ref={scrollContainerRef} className="overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <div className="flex gap-6 min-w-min">
                                {relatedProducts.map((product, index) => {
                                    const productId = product._id || product.id;
                                    const productImage = product.images?.[0] || product.image;
                                    return (
                                        <div
                                            key={productId}
                                            ref={(el) => (cardRefs.current[index] = el)}
                                            className="group transform-gpu transition-all duration-300 flex-shrink-0 w-48"
                                            style={{ transformStyle: 'preserve-3d' }}
                                        >
                                            {/* Product Image Container */}
                                            <div
                                                onClick={() => navigate(`/product/${productId}`)}
                                                className="relative bg-gray-100 rounded-lg overflow-hidden mb-3 aspect-square cursor-pointer shadow-lg"
                                                style={{ transform: 'translateZ(20px)' }}
                                            >
                                                {productImage ? (
                                                    <img
                                                        src={productImage}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700 ease-out"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                                        <ShoppingBag size={32} className="text-gray-400" />
                                                    </div>
                                                )}

                                                {/* Hover Overlay with Button */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/product/${productId}`);
                                                        }}
                                                        className="bg-white text-black font-bold px-4 py-2 rounded hover:bg-gray-200 transition-colors text-xs whitespace-nowrap"
                                                    >
                                                        View Detail
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Product Name */}
                                            <h3
                                                onClick={() => navigate(`/product/${productId}`)}
                                                className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 cursor-pointer transition-colors"
                                                style={{ transform: 'translateZ(15px)' }}
                                            >
                                                {product.name}
                                            </h3>

                                            {/* Product Price */}
                                            <p
                                                className="text-sm font-semibold text-gray-900"
                                                style={{ transform: 'translateZ(15px)' }}
                                            >
                                                {formatPrice(product.price)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
