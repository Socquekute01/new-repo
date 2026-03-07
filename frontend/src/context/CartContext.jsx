import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { cartAPI, cartItemAPI } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const prevUserIdRef = useRef(null);
    const [backendCartId, setBackendCartId] = useState(null);

    const getCartKey = () => {
        return isAuthenticated && user ? `cart_${user._id || user.id}` : 'cart_guest';
    };

    const [cartItems, setCartItems] = useState(() => {
        // Initialize from localStorage with user-specific key
        const savedCart = localStorage.getItem(getCartKey());
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(getCartKey(), JSON.stringify(cartItems));
    }, [cartItems]);

    // Sync with backend when user is authenticated
    const syncToBackend = async (items) => {
        if (!isAuthenticated || !user || !backendCartId) return;

        try {
            console.log('🔄 Syncing to backend...');
            const response = await cartItemAPI.getByCart(backendCartId);
            const backendItems = Array.isArray(response) ? response : (response.data || []);

            // Add or update each item
            for (const item of items) {
                const productId = item.product._id || item.product.id;
                const existing = backendItems.find((bi) => {
                    const backendProductId = typeof bi.product === 'object'
                        ? (bi.product._id || bi.product.id)
                        : bi.product;
                    return backendProductId === productId && bi.size === item.size;
                });

                if (existing) {
                    await cartItemAPI.updateItem(existing._id, item.quantity, item.product.price);
                } else {
                    await cartItemAPI.addItem(backendCartId, productId, item.quantity, item.product.price, item.size);
                }
            }
            console.log('✅ Synced to backend');
        } catch (error) {
            console.error('❌ Error syncing to backend:', error);
        }
    };

    // Load cart from backend
    const loadFromBackend = async () => {
        if (!isAuthenticated || !user) return [];

        try {
            console.log('📥 Loading cart from backend...');
            const response = await cartAPI.getMyCart();

            if (response.success) {
                const { cart, items } = response;
                setBackendCartId(cart._id);

                const formatted = items.map((item) => ({
                    product: item.product,
                    size: item.size || 'M',
                    quantity: item.quantity,
                }));

                console.log('✅ Loaded from backend:', formatted.length, 'items');
                return formatted;
            }
            return [];
        } catch (error) {
            console.error('❌ Error loading from backend:', error);
            return [];
        }
    };

    // Load and merge cart ONLY when user ID actually changes (login/logout)
    useEffect(() => {
        const currentUserId = user?._id || user?.id || null;

        // Check if user ID actually changed
        if (prevUserIdRef.current !== currentUserId) {
            if (isAuthenticated && user) {
                console.log('🔐 User logged in, merging carts...');
                // User just logged in - load from backend first, then merge with guest cart
                loadFromBackend().then((backendItems) => {
                    const guestCart = localStorage.getItem('cart_guest');
                    const userCartKey = `cart_${currentUserId}`;

                    console.log('Guest cart items:', guestCart ? JSON.parse(guestCart).length : 0);
                    console.log('Backend cart items:', backendItems.length);

                    let mergedCart = [...backendItems];

                    if (guestCart) {
                        const guestItems = JSON.parse(guestCart);

                        guestItems.forEach(guestItem => {
                            const guestProductId = guestItem.product._id || guestItem.product.id;
                            const existingIndex = mergedCart.findIndex(item => {
                                const itemProductId = item.product._id || item.product.id;
                                return itemProductId === guestProductId && item.size === guestItem.size;
                            });

                            if (existingIndex > -1) {
                                mergedCart[existingIndex].quantity += guestItem.quantity;
                            } else {
                                mergedCart.push(guestItem);
                            }
                        });

                        // Clear guest cart after merging
                        localStorage.setItem('cart_guest', JSON.stringify([]));
                    }

                    console.log('Merged cart items:', mergedCart.length);
                    setCartItems(mergedCart);

                    // Sync merged cart to backend
                    if (mergedCart.length > backendItems.length) {
                        setTimeout(() => syncToBackend(mergedCart), 500);
                    }
                });
            } else {
                console.log('👤 User logged out, switching to guest cart');
                setBackendCartId(null);
                setCartItems([]);
                localStorage.setItem('cart_guest', JSON.stringify([]));
            }

            prevUserIdRef.current = currentUserId;
        }
    }, [user, isAuthenticated]);

    const addToCart = async (product, size, quantity = 1) => {
        console.log('➕ addToCart called:', { product: product.name, size, quantity });

        const productId = product._id || product.id;

        setCartItems((prevItems) => {
            const existingItemIndex = prevItems.findIndex(
                (item) => {
                    const itemProductId = item.product._id || item.product.id;
                    return itemProductId === productId && item.size === size;
                }
            );

            let updatedItems;
            if (existingItemIndex > -1) {
                updatedItems = [...prevItems];
                const oldQty = updatedItems[existingItemIndex].quantity;
                updatedItems[existingItemIndex].quantity += quantity;
                console.log(`📦 Updated existing item: ${oldQty} + ${quantity} = ${updatedItems[existingItemIndex].quantity}`);
            } else {
                console.log(`🆕 Adding new item with quantity: ${quantity}`);
                updatedItems = [...prevItems, { product, size, quantity }];
            }

            return updatedItems;
        });

        // Sync to backend if authenticated
        if (isAuthenticated && user) {
            try {
                if (!backendCartId) {
                    const response = await cartAPI.getMyCart();
                    if (response.success) {
                        setBackendCartId(response.cart._id);
                        await cartItemAPI.addItem(response.cart._id, productId, quantity, product.price, size);
                    }
                } else {
                    await cartItemAPI.addItem(backendCartId, productId, quantity, product.price, size);
                }
                console.log('✅ Added to backend');
            } catch (error) {
                console.error('❌ Error adding to backend:', error);
            }
        }
    };

    const removeFromCart = async (productId, size) => {
        console.log('🗑️ removeFromCart called:', { productId, size });

        setCartItems((prevItems) =>
            prevItems.filter((item) => {
                const itemProductId = item.product._id || item.product.id;
                return !(itemProductId === productId && item.size === size);
            })
        );

        // Remove from backend if authenticated
        if (isAuthenticated && user && backendCartId) {
            try {
                console.log('🔍 Finding item to delete in backend...');
                const response = await cartItemAPI.getByCart(backendCartId);
                const backendItems = Array.isArray(response) ? response : (response.data || []);

                console.log('Backend items:', backendItems.length);

                const itemToDelete = backendItems.find((bi) => {
                    // Handle both populated (object) and unpopulated (string) product
                    const backendProductId = typeof bi.product === 'object'
                        ? (bi.product._id || bi.product.id)
                        : bi.product;
                    const matches = backendProductId === productId && bi.size === size;

                    if (matches) {
                        console.log('✅ Found matching item:', bi._id);
                    }

                    return matches;
                });

                if (itemToDelete) {
                    console.log('🗑️ Deleting item from backend:', itemToDelete._id);
                    await cartItemAPI.deleteItem(itemToDelete._id);
                    console.log('✅ Removed from backend successfully');
                } else {
                    console.log('⚠️ Item not found in backend');
                }
            } catch (error) {
                console.error('❌ Error removing from backend:', error);
                console.error('Error details:', error.response?.data || error.message);
            }
        } else {
            console.log('ℹ️ Not authenticated or no backend cart, skipping backend removal');
        }
    };

    const updateQuantity = async (productId, size, quantity) => {
        console.log('📝 updateQuantity called:', { productId, size, quantity });

        if (quantity < 1) {
            removeFromCart(productId, size);
            return;
        }

        setCartItems((prevItems) =>
            prevItems.map((item) => {
                const itemProductId = item.product._id || item.product.id;
                return itemProductId === productId && item.size === size
                    ? { ...item, quantity }
                    : item;
            })
        );

        // Update in backend if authenticated
        if (isAuthenticated && user && backendCartId) {
            try {
                const response = await cartItemAPI.getByCart(backendCartId);
                const backendItems = Array.isArray(response) ? response : (response.data || []);

                const itemToUpdate = backendItems.find((bi) => {
                    const backendProductId = typeof bi.product === 'object'
                        ? (bi.product._id || bi.product.id)
                        : bi.product;
                    return backendProductId === productId && bi.size === size;
                });

                if (itemToUpdate) {
                    await cartItemAPI.updateItem(itemToUpdate._id, quantity, itemToUpdate.price);
                    console.log('✅ Updated in backend');
                } else {
                    console.log('⚠️ Item not found in backend for update');
                }
            } catch (error) {
                console.error('❌ Error updating in backend:', error);
                console.error('Error details:', error.response?.data || error.message);
            }
        }
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + item.product.price * item.quantity;
        }, 0);
    };

    const getCartItemsCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal,
                getCartItemsCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
