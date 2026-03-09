import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Footer from "@/components/layout/Footer";
import { productAPI } from "@/api";
import { useCart } from "@/context/CartContext";

// ─── Replace with your real API & context ────────────────────────────────────
// import { productAPI, reviewAPI } from '@/services/api';
// import { useCart } from '@/context/CartContext';
// import { useAuth } from '@/context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_PRODUCT = {
  _id: "1",
  name: "Classic Black Oversized Tee",
  price: 450000,
  originalPrice: 600000,
  stock: 8,
  averageRating: 4.3,
  size: "S, M, L, XL, XXL",
  description:
    "Premium heavyweight cotton oversized tee. Drop shoulder construction with a boxy silhouette. Perfect for layering or wearing solo.",
  images: ["https://via.placeholder.com/600x600/1a1a1a/ffffff?text=Product"],
};
const MOCK_REVIEWS = [
  {
    _id: "r1",
    rating: 5,
    comment: "Chất lượng rất tốt, đúng như mô tả!",
    user: { name: "Minh Tuấn" },
  },
  {
    _id: "r2",
    rating: 4,
    comment: "Vải dày dặn, form đẹp. Sẽ mua thêm.",
    user: { name: "Thu Hà" },
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(price);

const normalizeSizes = (sizeField: any): string[] => {
  if (!sizeField) return [];
  if (Array.isArray(sizeField))
    return sizeField.map((s: any) => String(s).trim()).filter(Boolean);
  if (typeof sizeField === "string")
    return sizeField
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
};

// ─── STAR RATING DISPLAY ──────────────────────────────────────────────────────
function StarDisplay({
  rating,
  size = 16,
  color = "#FBBF24",
}: {
  rating: number;
  size?: number;
  color?: string;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Feather
          key={star}
          name="star"
          size={size}
          color={star <= Math.round(rating) ? color : "#D1D5DB"}
        />
      ))}
    </View>
  );
}

// ─── STAR RATING INPUT ────────────────────────────────────────────────────────
function StarInput({
  rating,
  onRate,
}: {
  rating: number;
  onRate: (v: number) => void;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRate(star)}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Feather
            name="star"
            size={28}
            color={star <= rating ? "#FBBF24" : "#D1D5DB"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── REVIEW CARD ─────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: any }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatar}>
          <Text style={styles.reviewAvatarTxt}>
            {(review.user?.name ||
              review.user?.username ||
              "U")[0].toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.reviewName}>
            {review.user?.name || review.user?.username || "User"}
          </Text>
          <StarDisplay rating={review.rating} size={13} />
        </View>
      </View>
      {review.comment ? (
        <Text style={styles.reviewComment}>{review.comment}</Text>
      ) : null}
    </View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart } = useCart();

  // Replace with real context:
  const isAuthenticated = false;
  const user: any = null;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity] = useState(1);

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [reviewEligibilityMessage, setReviewEligibilityMessage] = useState("");

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // ── Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productAPI.getById(id);
        setProduct(data.data || data);
        // await new Promise((r) => setTimeout(r, 600));
        // setProduct(MOCK_PRODUCT);
      } catch {
        Alert.alert("Lỗi", "Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        // const data = await reviewAPI.getByProduct(id);
        // setReviews(Array.isArray(data) ? data : []);
        await new Promise((r) => setTimeout(r, 400));
        // setReviews(MOCK_REVIEWS);
      } catch {
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    const checkEligibility = async () => {
      try {
        // const data = await reviewAPI.canReview(id);
        // setCanReview(data.canReview);
        // setReviewEligibilityMessage(data.message || '');
        setCanReview(true);
      } catch {
        setCanReview(false);
      }
    };

    fetchProduct();
    fetchReviews();
    if (isAuthenticated) checkEligibility();
  }, [id, isAuthenticated]);

  // ── Pre-fill my review
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
      setComment(myReview.comment || "");
    } else {
      setRating(0);
      setComment("");
    }
  }, [myReview?._id]);

  // ── Add to cart
  const handleAddToCart = useCallback(() => {
    if (!selectedSize) {
      Alert.alert(
        "Chọn size",
        "Vui lòng chọn size trước khi thêm vào giỏ hàng.",
      );
      return;
    }
    console.log(123)
    addToCart(product, selectedSize, 1);
    setSelectedSize("");
    Alert.alert("✓ Đã thêm", `${product.name} đã được thêm vào giỏ hàng.`);
  }, [selectedSize, product]);

  // ── Buy now
  const handleBuyNow = useCallback(() => {
    if (!selectedSize) {
      Alert.alert("Chọn size", "Vui lòng chọn size trước khi mua.");
      return;
    }
    addToCart(product, selectedSize, quantity);
    router.push("/cart");
  }, [selectedSize, product, quantity]);

  // ── Submit review
  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (!rating) {
      Alert.alert("Thiếu đánh giá", "Vui lòng chọn số sao.");
      return;
    }
    try {
      setIsSubmittingReview(true);
      // await reviewAPI.createOrUpdate(id, { rating, comment });
      await new Promise((r) => setTimeout(r, 800));
      Alert.alert(
        "Thành công",
        myReview ? "Đã cập nhật đánh giá." : "Cảm ơn đánh giá của bạn!",
      );
    } catch {
      Alert.alert("Lỗi", "Không thể gửi đánh giá.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // ── Loading
  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#1a1a1a" />
        <Text style={styles.loadingTxt}>Loading product...</Text>
      </View>
    );
  }

  // ── Not found
  if (!product) {
    return (
      <View style={styles.centerScreen}>
        <Feather name="alert-circle" size={48} color="#ccc" />
        <Text style={styles.notFoundTxt}>Product not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnTxt}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sizes = normalizeSizes(product.size);
  const productImage = product.images?.[0] || product.image;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ── Breadcrumb */}
        <View style={styles.breadcrumb}>
          <TouchableOpacity
            onPress={() => router.push("/")}
            style={styles.breadcrumbBtn}
          >
            <Feather name="home" size={14} color="#888" />
            <Text style={styles.breadcrumbTxt}>Home</Text>
          </TouchableOpacity>
          <Feather name="chevron-right" size={14} color="#ccc" />
          <TouchableOpacity
            onPress={() => router.push("/shop")}
            style={styles.breadcrumbBtn}
          >
            <Text style={styles.breadcrumbTxt}>Shop</Text>
          </TouchableOpacity>
          <Feather name="chevron-right" size={14} color="#ccc" />
          <Text style={styles.breadcrumbCurrent} numberOfLines={1}>
            {product.name}
          </Text>
        </View>

        {/* ── Product Image */}
        <View style={styles.imageWrap}>
          {productImage ? (
            <Image
              source={{ uri: productImage }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="shopping-bag" size={80} color="#ccc" />
            </View>
          )}
          {product.stock <= 0 && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockBadgeTxt}>OUT OF STOCK</Text>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          {/* ── Title */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* ── Rating */}
          {product.averageRating > 0 && (
            <View style={styles.ratingRow}>
              <StarDisplay rating={product.averageRating} size={16} />
              <Text style={styles.ratingTxt}>
                {product.averageRating.toFixed(1)} / 5.0
              </Text>
              <Text style={styles.reviewCountTxt}>
                ({reviews.length} đánh giá)
              </Text>
            </View>
          )}

          {/* ── Stock */}
          <View style={styles.stockRow}>
            <View
              style={[
                styles.stockDot,
                { backgroundColor: product.stock > 0 ? "#22c55e" : "#ef4444" },
              ]}
            />
            <Text
              style={[
                styles.stockTxt,
                { color: product.stock > 0 ? "#16a34a" : "#dc2626" },
              ]}
            >
              {product.stock > 0
                ? `In Stock (${product.stock})`
                : "Out of Stock"}
            </Text>
          </View>

          {/* ── Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <Text style={styles.originalPrice}>
                  {formatPrice(product.originalPrice)}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeTxt}>
                    -
                    {Math.round(
                      (1 - product.price / product.originalPrice) * 100,
                    )}
                    %
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* ── Size Selection */}
          {sizes.length > 0 && (
            <View style={styles.sizeSection}>
              <View style={styles.sizeLabelRow}>
                <Text style={styles.sizeLabel}>Choose Size</Text>
                <Text style={styles.sizeRequired}>*</Text>
                {selectedSize ? (
                  <Text style={styles.selectedSizeTxt}>— {selectedSize}</Text>
                ) : null}
              </View>
              <View style={styles.sizeGrid}>
                {sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <TouchableOpacity
                      key={size}
                      onPress={() => setSelectedSize(isSelected ? "" : size)}
                      style={[
                        styles.sizeBtn,
                        isSelected && styles.sizeBtnSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sizeBtnTxt,
                          isSelected && styles.sizeBtnTxtSelected,
                        ]}
                      >
                        {size}
                      </Text>
                      {isSelected && <View style={styles.sizeCornerMark} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* ── Add to Cart */}
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={product.stock <= 0}
            style={[
              styles.addToCartBtn,
              product.stock <= 0 && styles.btnDisabled,
            ]}
          >
            <Feather
              name="shopping-bag"
              size={18}
              color={product.stock <= 0 ? "#aaa" : "#1a1a1a"}
            />
            <Text
              style={[
                styles.addToCartTxt,
                product.stock <= 0 && styles.btnTxtDisabled,
              ]}
            >
              {product.stock <= 0 ? "OUT OF STOCK" : "ADD TO CART"}
            </Text>
          </TouchableOpacity>

          {/* ── Buy Now */}
          <TouchableOpacity
            onPress={handleBuyNow}
            disabled={product.stock <= 0}
            style={[styles.buyNowBtn, product.stock <= 0 && styles.btnDisabled]}
          >
            <Text
              style={[
                styles.buyNowTxt,
                product.stock <= 0 && styles.btnTxtDisabled,
              ]}
            >
              {product.stock <= 0 ? "OUT OF STOCK" : "BUY NOW"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Divider */}
        <View style={styles.divider} />

        {/* ── Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Reviews</Text>

          {/* Review List */}
          {reviewsLoading ? (
            <ActivityIndicator
              size="small"
              color="#1a1a1a"
              style={{ marginVertical: 16 }}
            />
          ) : reviews.length === 0 ? (
            <View style={styles.emptyReviews}>
              <Feather name="message-square" size={32} color="#ddd" />
              <Text style={styles.emptyReviewsTxt}>Chưa có đánh giá nào.</Text>
            </View>
          ) : (
            reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))
          )}

          {/* ── Review Form */}
          <View style={styles.reviewFormCard}>
            <Text style={styles.reviewFormTitle}>
              {myReview ? "Cập nhật đánh giá" : "Viết đánh giá"}
            </Text>

            {!isAuthenticated ? (
              <View style={styles.loginPrompt}>
                <Feather name="lock" size={16} color="#92400e" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.loginPromptTxt}>
                    Bạn cần đăng nhập để đánh giá.
                  </Text>
                  <TouchableOpacity onPress={() => router.push("/auth")}>
                    <Text style={styles.loginPromptLink}>Đăng nhập ngay →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : canReview === false ? (
              <View style={styles.cannotReview}>
                <Text style={styles.cannotReviewTxt}>
                  {reviewEligibilityMessage}
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.ratingInputLabel}>Đánh giá của bạn</Text>
                <StarInput rating={rating} onRate={setRating} />
                <TextInput
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Chia sẻ cảm nhận về sản phẩm..."
                  placeholderTextColor="#aaa"
                  multiline
                  numberOfLines={4}
                  style={styles.commentInput}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  onPress={handleSubmitReview}
                  disabled={isSubmittingReview}
                  style={[
                    styles.submitReviewBtn,
                    isSubmittingReview && styles.btnDisabled,
                  ]}
                >
                  {isSubmittingReview ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitReviewTxt}>
                      {myReview ? "Cập nhật" : "Gửi đánh giá"}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* ── Description */}
        {product.description && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Product Description</Text>
              <Text style={styles.descriptionTxt}>{product.description}</Text>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
        <Footer />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Center states
  centerScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 24,
  },
  loadingTxt: { color: "#666", fontSize: 15 },
  notFoundTxt: { fontSize: 17, color: "#555", fontWeight: "600" },
  backBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
  },
  backBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // Breadcrumb
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
    flexWrap: "wrap",
  },
  breadcrumbBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  breadcrumbTxt: { fontSize: 13, color: "#888" },
  breadcrumbCurrent: {
    fontSize: 13,
    color: "#1a1a1a",
    fontWeight: "600",
    flex: 1,
  },

  // Image
  imageWrap: {
    position: "relative",
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: "#f5f5f5",
  },
  productImage: { width: "100%", height: "100%" },
  imagePlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  outOfStockBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  outOfStockBadgeTxt: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  // Info section
  infoSection: { paddingHorizontal: 20, paddingTop: 20 },
  productName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a1a",
    lineHeight: 30,
    marginBottom: 10,
  },

  // Rating
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  ratingTxt: { fontSize: 13, color: "#555", fontWeight: "600" },
  reviewCountTxt: { fontSize: 13, color: "#aaa" },

  // Stock
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockTxt: { fontSize: 13, fontWeight: "600" },

  // Price
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  price: { fontSize: 24, fontWeight: "900", color: "#1a1a1a" },
  originalPrice: {
    fontSize: 16,
    color: "#aaa",
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  discountBadgeTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },

  // Size
  sizeSection: { marginBottom: 24 },
  sizeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  sizeLabel: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  sizeRequired: { color: "#ef4444", fontSize: 14, fontWeight: "700" },
  selectedSizeTxt: { fontSize: 14, color: "#555" },
  sizeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  sizeBtn: {
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 52,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  sizeBtnSelected: { borderColor: "#1a1a1a", borderWidth: 2 },
  sizeBtnTxt: { fontSize: 13, fontWeight: "600", color: "#555" },
  sizeBtnTxtSelected: { color: "#1a1a1a" },
  sizeCornerMark: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderTopWidth: 16,
    borderTopColor: "#ef4444",
    borderLeftWidth: 16,
    borderLeftColor: "transparent",
  },

  // Buttons
  addToCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#1a1a1a",
    borderRadius: 4,
    paddingVertical: 16,
    marginBottom: 12,
  },
  addToCartTxt: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
  buyNowBtn: {
    backgroundColor: "#1a1a1a",
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  buyNowTxt: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  btnDisabled: { borderColor: "#e5e5e5", backgroundColor: "#f5f5f5" },
  btnTxtDisabled: { color: "#aaa" },

  // Divider
  divider: { height: 8, backgroundColor: "#f5f5f5", marginVertical: 4 },

  // Sections
  section: { paddingHorizontal: 20, paddingVertical: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 16,
  },

  // Reviews
  emptyReviews: { alignItems: "center", paddingVertical: 24, gap: 8 },
  emptyReviewsTxt: { color: "#aaa", fontSize: 14 },
  reviewCard: {
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  reviewAvatarTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
  reviewName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 3,
  },
  reviewComment: { fontSize: 14, color: "#555", lineHeight: 20 },

  // Review Form
  reviewFormCard: {
    borderWidth: 1.5,
    borderColor: "#f0f0f0",
    borderRadius: 12,
    padding: 18,
    marginTop: 8,
    backgroundColor: "#fafafa",
  },
  reviewFormTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  ratingInputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 10,
  },
  commentInput: {
    borderWidth: 1.5,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
    marginTop: 14,
    marginBottom: 4,
    minHeight: 100,
    backgroundColor: "#fff",
  },
  submitReviewBtn: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  submitReviewTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // Login Prompt
  loginPrompt: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 8,
    padding: 12,
  },
  loginPromptTxt: { fontSize: 13, color: "#78350f", marginBottom: 4 },
  loginPromptLink: { fontSize: 13, color: "#92400e", fontWeight: "700" },
  cannotReview: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
  },
  cannotReviewTxt: { fontSize: 13, color: "#555" },

  // Description
  descriptionTxt: { fontSize: 15, color: "#555", lineHeight: 24 },
});
