import Footer from "@/components/layout/Footer";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Replace with your real context & API ────────────────────────────────────
// import { useCart } from '@/context/CartContext';
// import { useAuth } from '@/context/AuthContext';
// import { productAPI } from '@/services/api';

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_CART_ITEMS = [
  {
    product: {
      _id: "1",
      name: "Classic Black Tee",
      price: 450000,
      stock: 10,
      images: ["https://via.placeholder.com/200/111/fff?text=Tee"],
    },
    size: "M",
    quantity: 2,
  },
  {
    product: {
      _id: "2",
      name: "Limited Edition Hoodie",
      price: 1200000,
      stock: 3,
      images: ["https://via.placeholder.com/200/333/fff?text=Hoodie"],
    },
    size: "L",
    quantity: 1,
  },
];
const MOCK_RELATED = [
  {
    _id: "r1",
    name: "Cargo Shorts",
    price: 680000,
    images: ["https://via.placeholder.com/200/444/fff?text=Cargo"],
  },
  {
    _id: "r2",
    name: "Drop Tee",
    price: 320000,
    images: ["https://via.placeholder.com/200/555/fff?text=Drop"],
  },
  {
    _id: "r3",
    name: "Vintage Pants",
    price: 980000,
    images: ["https://via.placeholder.com/200/222/fff?text=Pants"],
  },
  {
    _id: "r4",
    name: "Graphic Shirt",
    price: 550000,
    images: ["https://via.placeholder.com/200/666/fff?text=Shirt"],
  },
  {
    _id: "r5",
    name: "Bomber Jacket",
    price: 1500000,
    images: ["https://via.placeholder.com/200/777/fff?text=Jacket"],
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(price);

// ─── CART ITEM ROW ────────────────────────────────────────────────────────────
function CartItemRow({ item, onRemove, onUpdateQty, onNavigate }: any) {
  const productId = item.product._id || item.product.id;
  const productImage = item.product.images?.[0] || item.product.image;
  const isMaxQty = item.quantity >= item.product.stock;

  const handleRemove = () => {
    Alert.alert("Remove Item", `Remove "${item.product.name}" from cart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => onRemove(productId, item.size),
      },
    ]);
  };

  return (
    <View style={styles.cartRow}>
      {/* Product Image */}
      <TouchableOpacity
        onPress={() => onNavigate(productId)}
        activeOpacity={0.85}
      >
        {productImage ? (
          <Image source={{ uri: productImage }} style={styles.cartItemImage} />
        ) : (
          <View style={[styles.cartItemImage, styles.imagePlaceholder]}>
            <Feather name="shopping-bag" size={24} color="#ccc" />
          </View>
        )}
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.cartItemInfo}>
        <TouchableOpacity onPress={() => onNavigate(productId)}>
          <Text style={styles.cartItemName} numberOfLines={2}>
            {item.product.name}
          </Text>
        </TouchableOpacity>
        <Text style={styles.cartItemSize}>Size: {item.size}</Text>
        <Text style={styles.cartItemPrice}>
          {formatPrice(item.product.price)}
        </Text>

        {/* Quantity Row */}
        <View style={styles.qtyRow}>
          <TouchableOpacity
            onPress={() => onUpdateQty(productId, item.size, item.quantity - 1)}
            style={styles.qtyBtn}
          >
            <Feather name="minus" size={14} color="#333" />
          </TouchableOpacity>
          <Text style={styles.qtyTxt}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() =>
              onUpdateQty(
                productId,
                item.size,
                Math.min(item.product.stock, item.quantity + 1),
              )
            }
            disabled={isMaxQty}
            style={[styles.qtyBtn, isMaxQty && styles.qtyBtnDisabled]}
          >
            <Feather name="plus" size={14} color={isMaxQty ? "#ccc" : "#333"} />
          </TouchableOpacity>
          {isMaxQty && <Text style={styles.maxStockTxt}>Max</Text>}
        </View>
      </View>

      {/* Right: Total + Delete */}
      <View style={styles.cartItemRight}>
        <Text style={styles.cartItemTotal}>
          {formatPrice(item.product.price * item.quantity)}
        </Text>
        <TouchableOpacity
          onPress={handleRemove}
          style={styles.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="trash-2" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── RELATED PRODUCT CARD ─────────────────────────────────────────────────────
function RelatedCard({ product, onPress }: any) {
  const productImage = product.images?.[0] || product.image;
  return (
    <TouchableOpacity
      style={styles.relatedCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {productImage ? (
        <Image source={{ uri: productImage }} style={styles.relatedImage} />
      ) : (
        <View style={[styles.relatedImage, styles.imagePlaceholder]}>
          <Feather name="shopping-bag" size={28} color="#ccc" />
        </View>
      )}
      <Text style={styles.relatedName} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.relatedPrice}>{formatPrice(product.price)}</Text>
    </TouchableOpacity>
  );
}

// ─── EMPTY CART ───────────────────────────────────────────────────────────────
function EmptyCart({ onContinue }: { onContinue: () => void }) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIcon}>
        <Feather name="shopping-bag" size={56} color="#d1d5db" />
      </View>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>Add some items to get started</Text>
      <TouchableOpacity onPress={onContinue} style={styles.continueBtn}>
        <Text style={styles.continueBtnTxt}>Continue Shopping</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── MAIN CART SCREEN ─────────────────────────────────────────────────────────
export default function CartScreen() {
  const router = useRouter();

  // Replace with real context:
  const isAuthenticated = false;
  const [cartItems, setCartItems] = useState<any[]>(MOCK_CART_ITEMS);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  // Mock cart functions — replace with context:
  const removeFromCart = (productId: string, size: string) => {
    setCartItems((prev) =>
      prev.filter(
        (i) =>
          !(
            (i.product._id === productId || i.product.id === productId) &&
            i.size === size
          ),
      ),
    );
  };
  const updateQuantity = (productId: string, size: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) =>
        (i.product._id === productId || i.product.id === productId) &&
        i.size === size
          ? { ...i, quantity: qty }
          : i,
      ),
    );
  };
  const getCartTotal = () =>
    cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const getCartCount = () => cartItems.reduce((sum, i) => sum + i.quantity, 0);

  // Fetch related
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        // const data = await productAPI.getAll({ limit: 6 });
        // setRelatedProducts(data.data || data);
        await new Promise((r) => setTimeout(r, 500));
        setRelatedProducts(MOCK_RELATED);
      } catch {
        setRelatedProducts([]);
      } finally {
        setRelatedLoading(false);
      }
    };
    fetchRelated();
  }, []);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert("Đăng nhập", "Bạn cần đăng nhập để thanh toán.", [
        { text: "Huỷ", style: "cancel" },
        { text: "Đăng nhập", onPress: () => router.push("/login") },
      ]);
      return;
    }
    router.push("/order");
  };

  const handleNavigateProduct = (id: string) => router.push(`/product/${id}`);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── Title */}
      <View style={styles.titleRow}>
        <Text style={styles.screenTitle}>CART</Text>
        {cartItems.length > 0 && (
          <View style={styles.cartCountBadge}>
            <Text style={styles.cartCountTxt}>{getCartCount()} items</Text>
          </View>
        )}
      </View>

      {/* ── Empty State */}
      {cartItems.length === 0 ? (
        <EmptyCart onContinue={() => router.push("/")} />
      ) : (
        <>
          {/* ── Cart Items */}
          <View style={styles.cartList}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderTxt, { flex: 3 }]}>Product</Text>
              <Text
                style={[
                  styles.tableHeaderTxt,
                  { flex: 1, textAlign: "center" },
                ]}
              >
                Qty
              </Text>
              <Text
                style={[styles.tableHeaderTxt, { flex: 1, textAlign: "right" }]}
              >
                Total
              </Text>
            </View>

            {cartItems.map((item) => (
              <CartItemRow
                key={`${item.product._id || item.product.id}-${item.size}`}
                item={item}
                onRemove={removeFromCart}
                onUpdateQty={updateQuantity}
                onNavigate={handleNavigateProduct}
              />
            ))}
          </View>

          {/* ── Order Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            {/* Item breakdown */}
            <View style={styles.summaryRows}>
              {cartItems.map((item) => {
                const productId = item.product._id || item.product.id;
                return (
                  <View
                    key={`${productId}-${item.size}`}
                    style={styles.summaryRow}
                  >
                    <Text style={styles.summaryItemName} numberOfLines={1}>
                      {item.product.name} × {item.quantity}
                    </Text>
                    <Text style={styles.summaryItemPrice}>
                      {formatPrice(item.product.price * item.quantity)}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Divider */}
            <View style={styles.summaryDivider} />

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>
                {formatPrice(getCartTotal())}
              </Text>
            </View>

            {/* Checkout */}
            <TouchableOpacity
              onPress={handleCheckout}
              style={styles.checkoutBtn}
            >
              <Feather name="credit-card" size={18} color="#fff" />
              <Text style={styles.checkoutBtnTxt}>CHECKOUT</Text>
            </TouchableOpacity>

            {/* Continue Shopping */}
            <TouchableOpacity
              onPress={() => router.push("/")}
              style={styles.continueShoppingBtn}
            >
              <Feather name="arrow-left" size={16} color="#555" />
              <Text style={styles.continueShoppingTxt}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── Related Products */}
      {(relatedProducts.length > 0 || relatedLoading) && (
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>You Might Also Like</Text>

          {relatedLoading ? (
            <ActivityIndicator
              size="small"
              color="#1a1a1a"
              style={{ paddingVertical: 24 }}
            />
          ) : (
            <FlatList
              data={relatedProducts}
              keyExtractor={(item) => item._id || item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedList}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              renderItem={({ item }) => (
                <RelatedCard
                  product={item}
                  onPress={() => handleNavigateProduct(item._id || item.id)}
                />
              )}
            />
          )}
        </View>
      )}

      <View style={{ height: 32 }} />
      <Footer />
    </ScrollView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Title
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1a1a1a",
    letterSpacing: 1,
  },
  cartCountBadge: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cartCountTxt: { fontSize: 13, fontWeight: "600", color: "#555" },

  // Cart List
  cartList: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  tableHeaderTxt: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Cart Row
  cartRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    gap: 12,
  },
  cartItemImage: {
    width: 76,
    height: 76,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  imagePlaceholder: { justifyContent: "center", alignItems: "center" },
  cartItemInfo: { flex: 1 },
  cartItemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    lineHeight: 19,
    marginBottom: 3,
  },
  cartItemSize: { fontSize: 12, color: "#888", marginBottom: 3 },
  cartItemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },

  // Qty
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  qtyBtnDisabled: { backgroundColor: "#f5f5f5", borderColor: "#e5e5e5" },
  qtyTxt: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    minWidth: 24,
    textAlign: "center",
  },
  maxStockTxt: { fontSize: 11, color: "#f59e0b", fontWeight: "600" },

  // Cart item right
  cartItemRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 76,
  },
  cartItemTotal: { fontSize: 14, fontWeight: "800", color: "#1a1a1a" },
  deleteBtn: { padding: 4 },

  // Summary
  summaryCard: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 18,
    backgroundColor: "#fafafa",
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 14,
  },
  summaryRows: { gap: 8, marginBottom: 12 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryItemName: { flex: 1, fontSize: 13, color: "#555", marginRight: 8 },
  summaryItemPrice: { fontSize: 13, fontWeight: "600", color: "#333" },
  summaryDivider: { height: 1, backgroundColor: "#e5e5e5", marginBottom: 12 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  totalAmount: { fontSize: 22, fontWeight: "900", color: "#1a1a1a" },

  // Checkout button
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    paddingVertical: 16,
    marginBottom: 10,
  },
  checkoutBtnTxt: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1,
  },

  // Continue shopping
  continueShoppingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingVertical: 13,
  },
  continueShoppingTxt: { fontSize: 14, fontWeight: "600", color: "#555" },

  // Empty
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  emptySubtitle: { fontSize: 14, color: "#888", marginBottom: 24 },
  continueBtn: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  continueBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // Related
  relatedSection: { paddingTop: 8 },
  relatedTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 16,
  },
  relatedList: { paddingHorizontal: 16, paddingBottom: 4 },
  relatedCard: { width: 140 },
  relatedImage: {
    width: 140,
    height: 140,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    marginBottom: 8,
  },
  relatedName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1a1a1a",
    lineHeight: 17,
    marginBottom: 3,
  },
  relatedPrice: { fontSize: 12, fontWeight: "800", color: "#1a1a1a" },
});
