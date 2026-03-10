import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { cartAPI, cartItemAPI } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --- 1. Định nghĩa các Interface ---
export interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  image?: string;
  // Thêm các thuộc tính khác của product nếu cần
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    product: Product,
    size: string,
    quantity?: number,
  ) => Promise<void>;
  removeFromCart: (productId: string, size: string) => Promise<void>;
  updateQuantity: (
    productId: string,
    size: string,
    quantity: number,
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
  isInitialized: boolean;
}

// --- 2. Khởi tạo Context với kiểu dữ liệu ---
const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const prevUserIdRef = useRef<string | null>(null);
  const [backendCartId, setBackendCartId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Helper lấy ID nhất quán từ object product
  const getPid = (p: Product) => p._id || p.id || "";

  const getCartKey = () => {
    return isAuthenticated && user
      ? `cart_${user._id || user.id}`
      : "cart_guest";
  };

  // 1. Khởi tạo giỏ hàng từ AsyncStorage
  useEffect(() => {
    const initCart = async () => {
      const key = getCartKey();
      const savedCart = await AsyncStorage.getItem(key);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      setIsInitialized(true);
    };
    initCart();
  }, [isAuthenticated, user]);

  // 2. Lưu giỏ hàng mỗi khi thay đổi
  useEffect(() => {
    if (isInitialized) {
      AsyncStorage.setItem(getCartKey(), JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  const syncToBackend = async (items: CartItem[]) => {
    if (!isAuthenticated || !user || !backendCartId) return;
    try {
      const response = await cartItemAPI.getByCart(backendCartId);
      const backendItems: any[] = Array.isArray(response)
        ? response
        : response.data || [];

      for (const item of items) {
        const productId = getPid(item.product);
        const existing = backendItems.find((bi) => {
          const bPid =
            typeof bi.product === "object" ? getPid(bi.product) : bi.product;
          return bPid === productId && bi.size === item.size;
        });

        if (existing) {
          await cartItemAPI.updateItem(
            existing._id,
            item.quantity,
            item.product.price,
          );
        } else {
          await cartItemAPI.addItem(
            backendCartId,
            productId,
            item.quantity,
            item.product.price,
            item.size,
          );
        }
      }
    } catch (error) {
      console.error("❌ Sync error:", error);
    }
  };

  const loadFromBackend = async (): Promise<CartItem[]> => {
    if (!isAuthenticated || !user) return [];
    try {
      const response = await cartAPI.getMyCart();
      if (response.success) {
        setBackendCartId(response.cart._id);
        return response.items.map((item: any) => ({
          product: item.product,
          size: item.size || "M",
          quantity: item.quantity,
        }));
      }
      return [];
    } catch (error) {
      return [];
    }
  };

  useEffect(() => {
    const handleAuthChange = async () => {
      const currentUserId = user?._id || user?.id || null;
      if (prevUserIdRef.current !== currentUserId) {
        if (isAuthenticated && user) {
          const backendItems = await loadFromBackend();
          const guestCartRaw = await AsyncStorage.getItem("cart_guest");
          const guestItems: CartItem[] = guestCartRaw
            ? JSON.parse(guestCartRaw)
            : [];

          let mergedCart = [...backendItems];

          guestItems.forEach((guestItem) => {
            const guestPid = getPid(guestItem.product);
            const existingIndex = mergedCart.findIndex(
              (item) =>
                getPid(item.product) === guestPid &&
                item.size === guestItem.size,
            );

            if (existingIndex > -1) {
              mergedCart[existingIndex].quantity += guestItem.quantity;
            } else {
              mergedCart.push(guestItem);
            }
          });

          await AsyncStorage.setItem("cart_guest", JSON.stringify([]));
          setCartItems(mergedCart);

          if (mergedCart.length > backendItems.length) {
            setTimeout(() => syncToBackend(mergedCart), 500);
          }
        } else {
          setBackendCartId(null);
          setCartItems([]);
          await AsyncStorage.setItem("cart_guest", JSON.stringify([]));
        }
        prevUserIdRef.current = currentUserId;
      }
    };
    handleAuthChange();
  }, [user, isAuthenticated]);

  const addToCart = async (
    product: Product,
    size: string,
    quantity: number = 1,
  ) => {
    const productId = getPid(product);

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => getPid(item.product) === productId && item.size === size,
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prevItems, { product, size, quantity }];
    });

    if (isAuthenticated && user) {
      try {
        let currentId = backendCartId;
        if (!currentId) {
          const res = await cartAPI.getMyCart();
          if (res.success) {
            currentId = res.cart._id;
            setBackendCartId(currentId);
          }
        }
        if (currentId) {
          await cartItemAPI.addItem(
            currentId,
            productId,
            quantity,
            product.price,
            size,
          );
        }
      } catch (error) {
        console.error("❌ Backend add error:", error);
      }
    }
  };

  const removeFromCart = async (productId: string, size: string) => {
    setCartItems((prev) =>
      prev.filter((i) => !(getPid(i.product) === productId && i.size === size)),
    );

    if (isAuthenticated && user && backendCartId) {
      try {
        const response = await cartItemAPI.getByCart(backendCartId);
        const bItems: any[] = Array.isArray(response)
          ? response
          : response.data || [];
        const toDelete = bItems.find((bi) => {
          const bPid =
            typeof bi.product === "object" ? getPid(bi.product) : bi.product;
          return bPid === productId && bi.size === size;
        });
        if (toDelete) await cartItemAPI.deleteItem(toDelete._id);
      } catch (error) {
        console.error("❌ Backend remove error:", error);
      }
    }
  };

  const updateQuantity = async (
    productId: string,
    size: string,
    quantity: number,
  ) => {
    if (quantity < 1) {
      await removeFromCart(productId, size);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        getPid(item.product) === productId && item.size === size
          ? { ...item, quantity }
          : item,
      ),
    );

    if (isAuthenticated && user && backendCartId) {
      try {
        const response = await cartItemAPI.getByCart(backendCartId);
        const bItems: any[] = Array.isArray(response)
          ? response
          : response.data || [];
        const toUpdate = bItems.find((bi) => {
          const bPid =
            typeof bi.product === "object" ? getPid(bi.product) : bi.product;
          return bPid === productId && bi.size === size;
        });
        if (toUpdate)
          await cartItemAPI.updateItem(toUpdate._id, quantity, toUpdate.price);
      } catch (error) {
        console.error("❌ Backend update error:", error);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    await AsyncStorage.removeItem(getCartKey());
  };

  const getCartTotal = () =>
    cartItems.reduce((t, i) => t + i.product.price * i.quantity, 0);
  const getCartItemsCount = () => cartItems.reduce((t, i) => t + i.quantity, 0);

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
        isInitialized,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
