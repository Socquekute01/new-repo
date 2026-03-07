import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// ─── Replace with your real context & API ────────────────────────────────────
// import { useCart } from '@/context/CartContext';
// import { useAuth } from '@/context/AuthContext';
// import { cartAPI, orderAPI, vnpayAPI } from '@/services/api';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_USER = { _id: "u1", email: "user@example.com", phone: "0901234567" };
const MOCK_CART = [
  {
    product: {
      _id: "1",
      name: "Classic Black Tee",
      price: 450000,
      images: ["https://via.placeholder.com/80/111/fff?text=Tee"],
    },
    size: "M",
    quantity: 2,
  },
  {
    product: {
      _id: "2",
      name: "Limited Hoodie",
      price: 1200000,
      images: ["https://via.placeholder.com/80/333/fff?text=Hoodie"],
    },
    size: "L",
    quantity: 1,
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(price);

const getItemPrice = (item: any) =>
  typeof item?.price === "number" ? item.price : (item?.product?.price ?? 0);
const getProductId = (item: any) =>
  item?.product?._id || item?.product?.id || item?.product;

// ─── FORM INPUT COMPONENT ─────────────────────────────────────────────────────
function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  required,
}: any) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={inputStyles.wrap}>
      {label && (
        <Text style={inputStyles.label}>
          {label}
          {required && <Text style={{ color: "#ef4444" }}> *</Text>}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        keyboardType={keyboardType || "default"}
        autoCapitalize={autoCapitalize || "sentences"}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[inputStyles.input, focused && inputStyles.inputFocused]}
      />
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1a1a1a",
    backgroundColor: "#fff",
  },
  inputFocused: { borderColor: "#1a1a1a" },
});

// ─── PAYMENT METHOD OPTION ────────────────────────────────────────────────────
function PaymentOption({
  value,
  selected,
  onSelect,
  title,
  subtitle,
  icon,
}: any) {
  return (
    <TouchableOpacity
      onPress={() => onSelect(value)}
      style={[styles.paymentOption, selected && styles.paymentOptionSelected]}
      activeOpacity={0.8}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.paymentTitle}>{title}</Text>
        <Text style={styles.paymentSubtitle}>{subtitle}</Text>
      </View>
      {icon}
    </TouchableOpacity>
  );
}

// ─── ORDER ITEM ROW ───────────────────────────────────────────────────────────
function OrderItemRow({ item }: any) {
  const product = item.product;
  const productId = getProductId(item);
  const productImage = product?.images?.[0] || product?.image;
  const productName = product?.name || "Product";
  const productPrice = getItemPrice(item);
  const size = item.size || "One Size";

  return (
    <View style={styles.orderItemRow}>
      <View style={styles.orderItemImageWrap}>
        {productImage ? (
          <Image source={{ uri: productImage }} style={styles.orderItemImage} />
        ) : (
          <View
            style={[
              styles.orderItemImage,
              {
                backgroundColor: "#f0f0f0",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Feather name="shopping-bag" size={20} color="#ccc" />
          </View>
        )}
        <View style={styles.qtyBadge}>
          <Text style={styles.qtyBadgeTxt}>{item.quantity}</Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.orderItemName} numberOfLines={2}>
          {productName}
        </Text>
        <Text style={styles.orderItemSize}>Size: {size}</Text>
      </View>
      <Text style={styles.orderItemTotal}>
        {formatPrice(productPrice * item.quantity)}
      </Text>
    </View>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
function SectionHeader({ title, step }: { title: string; step: number }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeTxt}>{step}</Text>
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function OrderScreen() {
  const router = useRouter();

  // Replace with real context:
  const user = MOCK_USER;
  const isAuthenticated = true;
  const cartItems = MOCK_CART;
  const clearCart = () => console.log("clearCart");

  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [serverCartItems, setServerCartItems] = useState<any[] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "vnpay">("cod");

  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: "",
    lastName: "",
    phone: user?.phone || "",
    address: "",
    district: "",
    city: "",
  });

  const shippingFee = 0;

  const effectiveCartItems = useMemo(
    () => (serverCartItems !== null ? serverCartItems : cartItems),
    [serverCartItems, cartItems],
  );

  const subtotal = useMemo(
    () =>
      effectiveCartItems.reduce(
        (total, item) => total + getItemPrice(item) * item.quantity,
        0,
      ),
    [effectiveCartItems],
  );
  const total = subtotal + shippingFee;

  // Fetch server cart
  useEffect(() => {
    const fetchCart = async () => {
      if (!isAuthenticated) {
        setServerCartItems(null);
        return;
      }
      try {
        setCartLoading(true);
        // const response = await cartAPI.getMyCart();
        // if (response?.success) setServerCartItems(Array.isArray(response.items) ? response.items : []);
        // else setServerCartItems(null);
        await new Promise((r) => setTimeout(r, 300));
        setServerCartItems(null); // use local cart in mock
      } catch {
        setServerCartItems(null);
      } finally {
        setCartLoading(false);
      }
    };
    fetchCart();
  }, [isAuthenticated]);

  const setField = (key: string) => (val: string) =>
    setFormData((prev) => ({ ...prev, [key]: val }));

  // Validate
  const validate = (): string | null => {
    const { email, firstName, lastName, phone, address, district, city } =
      formData;
    if (
      !email ||
      !firstName ||
      !lastName ||
      !phone ||
      !address ||
      !district ||
      !city
    )
      return "Vui lòng điền đầy đủ thông tin!";
    if (!/^[0-9]{10,11}$/.test(phone))
      return "Số điện thoại không hợp lệ (10-11 số)!";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email không hợp lệ!";
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      Alert.alert("Lỗi", error);
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        user: user._id,
        items: effectiveCartItems.map((item) => ({
          product: getProductId(item),
          quantity: item.quantity,
          price: getItemPrice(item),
        })),
        status: "pending",
        paymentMethod,
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

      // const response = await orderAPI.create(orderData);
      // const orderId = response?.order?._id || response?.order?.id;
      const response = { order: { _id: "mock-order-id" } };
      const orderId = response.order._id;

      if (paymentMethod === "vnpay") {
        // const paymentResponse = await vnpayAPI.createPaymentUrl({ orderId });
        // const paymentUrl = paymentResponse?.paymentUrl;
        const paymentUrl = `https://sandbox.vnpayment.vn/tryitnow/Home/CreateOrder?orderId=${orderId}`;
        if (!paymentUrl) {
          Alert.alert("Lỗi", "Không tạo được link thanh toán VNPay.");
          return;
        }

        clearCart();
        // Open VNPay in browser:
        await Linking.openURL(paymentUrl);
        return;
      }

      clearCart();
      Alert.alert(
        "✓ Đặt hàng thành công!",
        "Đơn hàng của bạn đã được tiếp nhận.",
        [{ text: "Về trang chủ", onPress: () => router.push("/") }],
      );
    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message || "Đặt hàng thất bại! Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Empty cart
  if (!cartLoading && effectiveCartItems.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Feather name="shopping-bag" size={56} color="#d1d5db" />
        <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
        <TouchableOpacity
          onPress={() => router.push("/")}
          style={styles.emptyBtn}
        >
          <Text style={styles.emptyBtnTxt}>Quay về trang chủ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        {/* ── Breadcrumb */}
        <View style={styles.breadcrumb}>
          <TouchableOpacity
            onPress={() => router.push("/cart")}
            style={styles.breadcrumbBtn}
          >
            <Text style={styles.breadcrumbTxt}>GIỎ HÀNG</Text>
          </TouchableOpacity>
          <Feather name="chevron-right" size={14} color="#bbb" />
          <Text style={[styles.breadcrumbTxt, styles.breadcrumbActive]}>
            THÔNG TIN
          </Text>
          <Feather name="chevron-right" size={14} color="#bbb" />
          <Text style={styles.breadcrumbTxt}>VẬN CHUYỂN</Text>
        </View>

        <View style={styles.content}>
          {/* ══════════════════════════════════
              LEFT COLUMN — FORM
          ══════════════════════════════════ */}

          {/* ── Customer Info */}
          <View style={styles.card}>
            <SectionHeader title="Thông tin khách hàng" step={1} />
            <FormInput
              label="Email nhận thông báo"
              value={formData.email}
              onChangeText={setField("email")}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />
          </View>

          {/* ── Shipping Address */}
          <View style={styles.card}>
            <SectionHeader title="Địa chỉ nhận hàng" step={2} />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <FormInput
                  label="Họ"
                  value={formData.firstName}
                  onChangeText={setField("firstName")}
                  placeholder="Nguyễn"
                  required
                />
              </View>
              <View style={{ width: 10 }} />
              <View style={{ flex: 1 }}>
                <FormInput
                  label="Tên"
                  value={formData.lastName}
                  onChangeText={setField("lastName")}
                  placeholder="Văn A"
                  required
                />
              </View>
            </View>

            <FormInput
              label="Số điện thoại"
              value={formData.phone}
              onChangeText={setField("phone")}
              placeholder="09xxxxxxxx"
              keyboardType="phone-pad"
              required
            />
            <FormInput
              label="Địa chỉ"
              value={formData.address}
              onChangeText={setField("address")}
              placeholder="Số nhà, tên đường..."
              required
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <FormInput
                  label="Quận/Huyện"
                  value={formData.district}
                  onChangeText={setField("district")}
                  placeholder="Quận 1"
                  required
                />
              </View>
              <View style={{ width: 10 }} />
              <View style={{ flex: 1 }}>
                <FormInput
                  label="Thành phố"
                  value={formData.city}
                  onChangeText={setField("city")}
                  placeholder="TP. HCM"
                  required
                />
              </View>
            </View>
          </View>

          {/* ── Payment Method */}
          <View style={styles.card}>
            <SectionHeader title="Phương thức thanh toán" step={3} />

            <PaymentOption
              value="cod"
              selected={paymentMethod === "cod"}
              onSelect={setPaymentMethod}
              title="Thanh toán khi nhận hàng (COD)"
              subtitle="Thanh toán bằng tiền mặt khi nhận hàng"
              icon={<Feather name="dollar-sign" size={22} color="#555" />}
            />

            <View style={{ height: 10 }} />

            <PaymentOption
              value="vnpay"
              selected={paymentMethod === "vnpay"}
              onSelect={setPaymentMethod}
              title="Thanh toán qua VNPay"
              subtitle="ATM, Visa, MasterCard, QR Code"
              icon={
                <Image
                  source={{
                    uri: "https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png",
                  }}
                  style={{ width: 52, height: 28 }}
                  resizeMode="contain"
                />
              }
            />
          </View>

          {/* ══════════════════════════════════
              RIGHT COLUMN — ORDER SUMMARY
          ══════════════════════════════════ */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Đơn hàng của bạn</Text>

            {/* Items */}
            {cartLoading ? (
              <ActivityIndicator
                size="small"
                color="#1a1a1a"
                style={{ paddingVertical: 16 }}
              />
            ) : (
              effectiveCartItems.map((item) => (
                <OrderItemRow
                  key={`${getProductId(item)}-${item.size}`}
                  item={item}
                />
              ))
            )}

            {/* Totals */}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vận chuyển</Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: "#22c55e", fontWeight: "700" },
                ]}
              >
                Miễn phí
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>TỔNG CỘNG</Text>
              <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
            </View>
          </View>

          {/* ── Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          >
            {loading ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.submitBtnTxt}>ĐANG XỬ LÝ...</Text>
              </View>
            ) : (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <Feather name="check-circle" size={18} color="#fff" />
                <Text style={styles.submitBtnTxt}>HOÀN TẤT ĐẶT HÀNG</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/cart")}
            style={styles.backToCartBtn}
          >
            <Feather name="arrow-left" size={15} color="#555" />
            <Text style={styles.backToCartTxt}>Quay lại giỏ hàng</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },

  // Breadcrumb
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexWrap: "wrap",
  },
  breadcrumbBtn: {},
  breadcrumbTxt: {
    fontSize: 12,
    color: "#aaa",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  breadcrumbActive: { color: "#1a1a1a" },

  content: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },

  // Cards
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  stepBadgeTxt: { color: "#fff", fontSize: 13, fontWeight: "800" },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },

  // Row layout
  row: { flexDirection: "row" },

  // Payment
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    padding: 14,
  },
  paymentOptionSelected: { borderColor: "#1a1a1a", backgroundColor: "#fafafa" },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: { borderColor: "#1a1a1a" },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1a1a1a",
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  paymentSubtitle: { fontSize: 12, color: "#888" },

  // Order Summary Card
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 14,
  },

  // Order Item Row
  orderItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  orderItemImageWrap: { position: "relative" },
  orderItemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  qtyBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBadgeTxt: { color: "#fff", fontSize: 11, fontWeight: "700" },
  orderItemName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a1a",
    lineHeight: 18,
    marginBottom: 3,
  },
  orderItemSize: { fontSize: 12, color: "#888" },
  orderItemTotal: { fontSize: 13, fontWeight: "700", color: "#1a1a1a" },

  // Summary totals
  summaryDivider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 10 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  summaryLabel: { fontSize: 13, color: "#666" },
  summaryValue: { fontSize: 13, fontWeight: "600", color: "#1a1a1a" },
  totalLabel: { fontSize: 15, fontWeight: "800", color: "#1a1a1a" },
  totalAmount: { fontSize: 20, fontWeight: "900", color: "#1a1a1a" },

  // Submit
  submitBtn: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: { backgroundColor: "#aaa" },
  submitBtnTxt: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1,
  },
  backToCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  backToCartTxt: { fontSize: 14, color: "#555", fontWeight: "500" },

  // Empty
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#555" },
  emptyBtn: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 13,
    marginTop: 8,
  },
  emptyBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
