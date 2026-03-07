import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { productAPI, reviewAPI } from '../../src/services/api';
import { useCart } from '../../src/context/CartContext';
import { useAuth } from '../../src/context/AuthContext';
import { toast } from 'sonner';
import Header from '../../src/components/header/Header';
import Footer from '../../src/components/footer/Footer';

export default function Detailcard() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated, user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [canReview, setCanReview] = useState(null);
    const [reviewEligibilityMessage, setReviewEligibilityMessage] = useState('');

    useEffect(() => {
        fetchProduct();
        fetchReviews();
        if (isAuthenticated) {
            checkReviewEligibility();
        }
    }, [id, isAuthenticated]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const data = await productAPI.getById(id);
            setProduct(data.data || data);
        } catch (err) {
            console.error('Error fetching product:', err);
            toast.error('Không thể tải sản phẩm');
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            setReviewsLoading(true);
            setReviewsError('');
            const data = await reviewAPI.getByProduct(id);
            setReviews(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setReviewsError('Không thể tải đánh giá');
        } finally {
            setReviewsLoading(false);
        }
    };

    const checkReviewEligibility = async () => {
        try {
            const data = await reviewAPI.canReview(id);
            setCanReview(data.canReview);
            setReviewEligibilityMessage(data.message || '');
        } catch (err) {
            console.error('Error checking review eligibility:', err);
            setCanReview(false);
        }
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

    const myReview = isAuthenticated
        ? reviews.find((rev) => {
            const userId = rev?.user?._id || rev?.user?.id;
            const currentId = user?.id || user?._id;
            return userId && currentId && String(userId) === String(currentId);
        })
        : null;

    useEffect(() => {
        if (myReview) {
            setRating(myReview.rating || 0);
            setComment(myReview.comment || '');
        } else {
            setRating(0);
            setComment('');
        }
    }, [myReview?.rating, myReview?.comment, myReview?._id]);

    const handleSubmitReview = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!rating) {
            toast.error('Vui lòng chọn số sao đánh giá');
            return;
        }
        try {
            setIsSubmittingReview(true);
            await reviewAPI.createOrUpdate(id, { rating, comment });
            toast.success(myReview ? 'Cập nhật đánh giá thành công' : 'Đánh giá thành công');
            await Promise.all([fetchReviews(), fetchProduct()]);
        } catch (err) {
            console.error('Error submitting review:', err);
            const errorMessage = err.response?.data?.message || 'Không thể gửi đánh giá';
            toast.error(errorMessage);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleAddToCart = (e) => {
        e?.stopPropagation();

        if (!selectedSize || selectedSize.trim() === '') {
            toast.error('Please select a size before adding to the cart!');
            return;
        }

        console.log('🛒 handleAddToCart called in Detailcard');
        addToCart(product, selectedSize, 1);
        toast.success(`Product added to cart!`);
        setSelectedSize(''); // Reset size sau khi add thành công
    };

    const handleBuyNow = () => {
        if (!selectedSize || selectedSize.trim() === '') {
            toast.error('Please select a size before buying!');
            return;
        }

        addToCart(product, selectedSize, quantity);
        navigate('/cart');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg text-gray-600">Product not found</div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="flex mb-8 text-sm text-gray-600">
                    <button onClick={() => navigate('/')} className="hover:text-gray-900">
                        Home
                    </button>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">Product Detail</span>
                </nav>

                {/* Product Detail Container */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Left Side - Product Image */}
                    <div className="relative group">
                        {/* Product Image */}
                        <div className="bg-pink-50 rounded-lg overflow-hidden aspect-square flex items-center justify-center cursor-pointer">
                            {(product.images?.[0] || product.image) ? (
                                <img
                                    src={product.images?.[0] || product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-pink-200">
                                    <ShoppingBag size={120} className="text-gray-300" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Product Info */}
                    <div className="flex flex-col">
                        {/* Product Title */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        {product.averageRating > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, index) => (
                                        <svg
                                            key={index}
                                            className={`w-5 h-5 ${index < Math.floor(product.averageRating)
                                                ? 'text-yellow-400 fill-current'
                                                : index < product.averageRating
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300 fill-current'
                                                }`}
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-gray-600 text-sm">
                                    {product.averageRating.toFixed(1)} / 5.0
                                </span>
                            </div>
                        )}

                        {/* Stock Status */}
                        <div className="mb-4">
                            <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out Stock'}
                            </span>
                        </div>

                        {/* Price */}
                        <div className="text-2xl font-bold text-gray-900 mb-8">
                            {formatPrice(product.price)}
                        </div>

                        {/* Size Selection */}
                        {normalizeSizes(product.size).length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">
                                    Choose size <span className="text-red-600">*</span>
                                </h3>
                                <div className="grid grid-cols-5 gap-3">
                                    {normalizeSizes(product.size).map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                                            className={`relative py-3 border-2 text-center font-medium transition-all duration-200 ${selectedSize === size
                                                ? 'border-black bg-white'
                                                : 'border-gray-300 bg-white hover:border-gray-400'
                                                }`}
                                        >
                                            {size}
                                            {selectedSize === size && (
                                                <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-t-red-500 border-l-[20px] border-l-transparent"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                            className={`w-full py-4 border-2 font-bold text-lg transition-colors duration-200 mb-3 ${product.stock <= 0
                                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                                : 'border-gray-900 text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            {product.stock <= 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                        </button>

                        {/* Buy Now Button */}
                        <button
                            onClick={handleBuyNow}
                            disabled={product.stock <= 0}
                            className={`w-full py-4 font-bold text-lg transition-colors duration-200 mb-8 ${product.stock <= 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-black text-white hover:bg-gray-800'
                                }`}
                        >
                            {product.stock <= 0 ? 'OUT OF STOCK' : 'BUY NOW'}
                        </button>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-16 border-t pt-8" id="reviews">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Customer Reviews
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
                        {/* Review List */}
                        <div>
                            {reviewsLoading && (
                                <div className="text-sm text-gray-500">Loading reviews...</div>
                            )}
                            {reviewsError && (
                                <div className="text-sm text-red-500">{reviewsError}</div>
                            )}
                            {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                                <div className="text-sm text-gray-500">Chưa có đánh giá nào.</div>
                            )}

                            <div className="space-y-6">
                                {reviews.map((review) => (
                                    <div key={review._id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-semibold text-gray-900">
                                                {review.user?.name || review.user?.username || 'User'}
                                            </div>
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, index) => (
                                                    <svg
                                                        key={index}
                                                        className={`w-4 h-4 ${index < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'
                                                            }`}
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="text-gray-700 text-sm leading-relaxed">
                                                {review.comment}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Review Form */}
                        <div className="border rounded-lg p-5 h-fit">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {myReview ? 'Cập nhật đánh giá' : 'Viết đánh giá'}
                            </h3>

                            {!isAuthenticated ? (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm text-yellow-800">
                                        Bạn cần đăng nhập để đánh giá sản phẩm.
                                    </p>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="mt-3 text-sm font-medium text-yellow-900 hover:underline"
                                    >
                                        Đăng nhập ngay →
                                    </button>
                                </div>
                            ) : canReview === false ? (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-700">
                                        {reviewEligibilityMessage}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 mb-4">
                                        {[...Array(5)].map((_, index) => {
                                            const value = index + 1;
                                            return (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => setRating(value)}
                                                    className="focus:outline-none"
                                                    aria-label={`${value} stars`}
                                                >
                                                    <svg
                                                        className={`w-6 h-6 ${value <= rating
                                                            ? 'text-yellow-400 fill-current'
                                                            : 'text-gray-300 fill-current'
                                                            }`}
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Chia sẻ cảm nhận về sản phẩm..."
                                        rows={4}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                                    />
                                    <button
                                        onClick={handleSubmitReview}
                                        disabled={isSubmittingReview}
                                        className="mt-4 w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:bg-gray-400"
                                    >
                                        {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product Description */}
                {product.description && (
                    <div className="mt-16 border-t pt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Product Description
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {product.description}
                        </p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
