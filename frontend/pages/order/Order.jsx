import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../src/context/CartContext';
import { useAuth } from '../../src/context/AuthContext';
import { cartAPI, orderAPI, vnpayAPI } from '../../src/services/api';
import { toast } from 'sonner';
import Header from '../../src/components/header/Header';
import Footer from '../../src/components/footer/Footer';

export default function Order() {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);
    const [serverCartItems, setServerCartItems] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cod'); // cod, vnpay
    const [formData, setFormData] = useState({
        email: user?.email || '',
        firstName: '',
        lastName: '',
        phone: user?.phone || '',
        address: '',
        district: '',
        city: '',
    });

    const shippingFee = 0; // Miễn phí

    const getItemPrice = (item) => {
        if (typeof item?.price === 'number') {
            return item.price;
        }
        return item?.product?.price ?? 0;
    };

    const getProductId = (item) => {
        return item?.product?._id || item?.product?.id || item?.product;
    };

    const effectiveCartItems = useMemo(() => {
        return serverCartItems !== null ? serverCartItems : cartItems;
    }, [serverCartItems, cartItems]);

    const subtotal = useMemo(() => {
        return effectiveCartItems.reduce((total, item) => {
            return total + getItemPrice(item) * item.quantity;
        }, 0);
    }, [effectiveCartItems]);

    useEffect(() => {
        const fetchCartFromBackend = async () => {
            if (!isAuthenticated) {
                setServerCartItems(null);
                return;
            }

            try {
                setCartLoading(true);
                const response = await cartAPI.getMyCart();
                if (response?.success) {
                    const items = Array.isArray(response.items) ? response.items : [];
                    setServerCartItems(items);
                } else {
                    setServerCartItems(null);
                }
            } catch (error) {
                console.error('Error fetching cart from backend:', error);
                setServerCartItems(null);
            } finally {
                setCartLoading(false);
            }
        };

        fetchCartFromBackend();
    }, [isAuthenticated]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!formData.email || !formData.firstName || !formData.lastName || !formData.phone || !formData.address || !formData.district || !formData.city) {
            toast.error('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        // Validate phone
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(formData.phone)) {
            toast.error('Số điện thoại không hợp lệ!');
            return;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Email không hợp lệ!');
            return;
        }

        try {
            setLoading(true);

            // Prepare order data
            const orderData = {
                user: user._id || user.id,
                items: effectiveCartItems.map(item => ({
                    product: getProductId(item),
                    quantity: item.quantity,
                    price: getItemPrice(item),
                })),
                status: 'pending',
                paymentMethod: paymentMethod, // Thêm phương thức thanh toán
                shippingAddress: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    address: formData.address,
                    district: formData.district,
                    city: formData.city,
                },
                email: formData.email,
            };

            console.log('Creating order:', orderData);
            const response = await orderAPI.create(orderData);
            console.log('Order created:', response);

            const orderId = response?.order?._id || response?.order?.id;
            if (paymentMethod === 'vnpay') {
                if (!orderId) {
                    toast.error('Không lấy được mã đơn hàng để thanh toán VNPay.');
                    return;
                }

                const paymentResponse = await vnpayAPI.createPaymentUrl({ orderId });
                const paymentUrl = paymentResponse?.paymentUrl;
                if (!paymentUrl) {
                    toast.error('Không tạo được link thanh toán VNPay.');
                    return;
                }

                clearCart();
                window.location.href = paymentUrl;
                return;
            }

            toast.success('Đặt hàng thành công!');

            // Xóa localStorage cart
            const cartKey = user ? `cart_${user._id || user.id}` : 'cart_guest';
            localStorage.setItem(cartKey, JSON.stringify([]));

            clearCart();
            navigate('/');
        } catch (error) {
            console.error('Order creation error:', error);
            toast.error(error.response?.data?.message || 'Đặt hàng thất bại! Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const total = subtotal + shippingFee;

    if (!cartLoading && effectiveCartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-600 text-lg mb-6">Giỏ hàng của bạn đang trống</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-black text-white px-8 py-3 font-bold hover:bg-gray-800 transition-colors"
                    >
                        Quay về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-2">FASHION LAB</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="cursor-pointer hover:text-gray-700" onClick={() => navigate('/cart')}>GIỎ HÀNG</span>
                        <span>&gt;</span>
                        <span className="font-medium text-gray-900">THÔNG TIN</span>
                        <span>&gt;</span>
                        <span>VẬN CHUYỂN</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Column - Form */}
                        <div>
                            {/* Customer Information */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold mb-4">Thông tin khách hàng</h2>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Email nhận thông báo"
                                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500 transition-colors"
                                    required
                                />
                            </div>

                            {/* Shipping Address */}
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Địa chỉ nhận hàng</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            placeholder="Họ"
                                            className="px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500 transition-colors"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            placeholder="Tên"
                                            className="px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500 transition-colors"
                                            required
                                        />
                                    </div>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Số điện thoại"
                                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500 transition-colors"
                                        required
                                    />

                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Địa chỉ (Số nhà, tên đường...)"
                                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500 transition-colors"
                                        required
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            name="district"
                                            value={formData.district}
                                            onChange={handleInputChange}
                                            placeholder="Quận/Huyện"
                                            className="px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500 transition-colors"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Thành phố"
                                            className="px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="mt-6">
                                <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
                                <div className="space-y-3">
                                    {/* COD */}
                                    <label className="flex items-center gap-3 p-4 border-2 cursor-pointer transition-colors ${
                                        paymentMethod === 'cod' ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'
                                    }">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={paymentMethod === 'cod'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-5 h-5 text-black focus:ring-black"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
                                            <p className="text-sm text-gray-500 mt-1">Thanh toán bằng tiền mặt khi nhận hàng</p>
                                        </div>
                                        <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                        </svg>
                                    </label>

                                    {/* VNPay */}
                                    <label className="flex items-center gap-3 p-4 border-2 cursor-pointer transition-colors ${
                                        paymentMethod === 'vnpay' ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'
                                    }">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="vnpay"
                                            checked={paymentMethod === 'vnpay'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-5 h-5 text-black focus:ring-black"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">Thanh toán qua VNPay</p>
                                            <p className="text-sm text-gray-500 mt-1">Thanh toán qua cổng VNPay (ATM, Visa, MasterCard)</p>
                                        </div>
                                        <img
                                            src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png"
                                            alt="VNPay"
                                            className="h-8"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-8 bg-black text-white py-4 font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'ĐANG XỬ LÝ...' : 'HOÀN TẤT ĐẶT HÀNG'}
                            </button>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:pl-8">
                            {/* Products List */}
                            <div className="space-y-4 mb-6">
                                {effectiveCartItems.map((item) => {
                                    const product = item.product;
                                    const productId = getProductId(item);
                                    const productImage = product?.images?.[0] || product?.image;
                                    const productName = product?.name || 'Product';
                                    const productPrice = getItemPrice(item);
                                    const size = item.size || 'One Size';

                                    return (
                                        <div key={`${productId}-${size}`} className="flex gap-4">
                                            <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded">
                                                {productImage ? (
                                                    <img
                                                        src={productImage}
                                                        alt={productName}
                                                        className="w-full h-full object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 rounded"></div>
                                                )}
                                                <span className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                                    {item.quantity}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-sm mb-1">{productName}</h3>
                                                <p className="text-xs text-gray-500">Size: {size}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{formatPrice(productPrice * item.quantity)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Summary */}
                            <div className="border-t border-gray-200 pt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tạm tính</span>
                                    <span className="font-medium">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Vận chuyển</span>
                                    <span className="font-medium">Miễn phí</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3 flex justify-between">
                                    <span className="font-bold text-lg">TỔNG CỘNG</span>
                                    <span className="font-bold text-lg">{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <Footer />
        </div>
    );
}
