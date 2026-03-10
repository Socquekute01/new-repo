import { productAPI } from "@/api";
import Footer from "@/components/layout/Footer";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StyleSheet } from "react-native";

interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  bg: string;
  accent: string;
  image: string;
}

interface Feature {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  desc: string;
}

interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  image?: string;
  stock: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PRODUCTS_PER_PAGE = 8;

const BANNER_SLIDES: BannerSlide[] = [
  {
    id: "1",
    title: "NEW COLLECTION",
    subtitle: "Spring / Summer 2025",
    bg: "#1a1a1a",
    accent: "#ffffff",
    image:
      "https://i.pinimg.com/736x/bf/31/8c/bf318c439bd433880bf729504c8fc1e3.jpg",
  },
  {
    id: "2",
    title: "LIMITED DROP",
    subtitle: "Collab with World Artists",
    bg: "#2d2d2d",
    accent: "#e8e8e8",
    image:
      "https://i.pinimg.com/736x/49/a2/16/49a21650f366b7892a4aeaee996b9d88.jpg",
  },
  {
    id: "3",
    title: "BEST SELLERS",
    subtitle: "Most loved pieces",
    bg: "#111111",
    accent: "#cccccc",
    image:
      "https://i.pinimg.com/736x/51/b5/5f/51b55f823cb8d028d2c220a40f5e55ea.jpg",
  },
];

const FEATURES: Feature[] = [
  {
    id: "1",
    icon: "package",
    title: "Free Shipping",
    desc: "On orders over 500k. Fast and reliable delivery.",
  },
  {
    id: "2",
    icon: "check-circle",
    title: "100% Authentic",
    desc: "All products guaranteed original.",
  },
  {
    id: "3",
    icon: "clock",
    title: "Easy Returns",
    desc: "30-day return policy. Shop with confidence.",
  },
];

const formatPrice = (price: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(price);


interface BannerProps {
  onNavigate: (screen: string) => void;
}

function BannerSlider({ onNavigate }: BannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (activeIndex + 1) % BANNER_SLIDES.length;
      scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
      setActiveIndex(next);
    }, 3500);
    return () => clearInterval(timer);
  }, [activeIndex]);

  return (
    <View style={styles.bannerContainer}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveIndex(idx);
        }}
      >
        {BANNER_SLIDES.map((slide) => (
          <TouchableOpacity
            key={slide.id}
            activeOpacity={0.9}
            onPress={() => onNavigate("shop")}
          >
            <ImageBackground
              source={{ uri: slide.image }}
              style={[styles.bannerSlide, { backgroundColor: slide.bg }]}
              resizeMode="cover"
            >
              <Text
                style={[
                  styles.bannerSubtitle,
                  { color: slide.accent, opacity: 0.6 },
                ]}
              >
                {slide.subtitle}
              </Text>
              <Text style={[styles.bannerTitle, { color: slide.accent }]}>
                {slide.title}
              </Text>
              <View style={[styles.bannerBtn, { borderColor: slide.accent }]}>
                <Text style={[styles.bannerBtnTxt, { color: slide.accent }]}>
                  SHOP NOW
                </Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.dotsRow}>
        {BANNER_SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

interface ProductCardProps {
  product: Product;
  onNavigate: (screen: string) => void;
  onQuickView: (product: Product) => void;
}

function ProductCard({ product, onNavigate, onQuickView }: ProductCardProps) {
  const productId = product._id || product.id;
  const productImage = product.images?.[0] || product.image;

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => onNavigate(`product/${productId}`)}
      activeOpacity={0.85}
    >
      <View style={styles.productImageWrap}>
        {productImage ? (
          <Image source={{ uri: productImage }} style={styles.productImage} />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Feather name="shopping-bag" size={40} color="#ccc" />
          </View>
        )}
        <TouchableOpacity
          style={styles.quickViewBtn}
          onPress={() => onQuickView(product)}
        >
          <Text style={styles.quickViewTxt}>Quick View</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.productName} numberOfLines={2}>
        {product.name}
      </Text>
      <View style={styles.priceRow}>
        <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
        {product.originalPrice && product.originalPrice > product.price && (
          <Text style={styles.originalPrice}>
            {formatPrice(product.originalPrice)}
          </Text>
        )}
      </View>
      {product.stock <= 0 && (
        <Text style={styles.outOfStock}>Out of Stock</Text>
      )}
      {product.stock > 0 && product.stock < 5 && (
        <Text style={styles.lowStock}>Only {product.stock} left</Text>
      )}
    </TouchableOpacity>
  );
}

interface QuickViewProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

function QuickViewModal({
  product,
  visible,
  onClose,
  onNavigate,
}: QuickViewProps) {
  if (!product) return null;
  const productId = product._id || product.id;
  const productImage = product.images?.[0] || product.image;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <Feather name="x" size={24} color="#333" />
          </TouchableOpacity>
          {productImage && (
            <Image
              source={{ uri: productImage }}
              style={styles.modalImage}
              resizeMode="cover"
            />
          )}
          <Text style={styles.modalName}>{product.name}</Text>
          <Text style={styles.modalPrice}>{formatPrice(product.price)}</Text>
          <TouchableOpacity
            style={styles.modalViewBtn}
            onPress={() => {
              onClose();
              onNavigate(`product/${productId}`);
            }}
          >
            <Text style={styles.modalViewBtnTxt}>View Full Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}


function ProductGrid({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      try {
        const listProduct = await productAPI.getAll();
        setProducts(listProduct || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#1a1a1a" />
        <Text style={styles.loadingTxt}>Loading products...</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={paginatedProducts}
        keyExtractor={(item) => (item._id || item.id) as string}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onNavigate={onNavigate}
            onQuickView={setQuickViewProduct}
          />
        )}
      />
      {totalPages > 1 && (
        <View style={styles.paginationRow}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <TouchableOpacity
              key={page}
              onPress={() => setCurrentPage(page)}
              style={[
                styles.pageBtn,
                currentPage === page && styles.pageBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.pageBtnTxt,
                  currentPage === page && styles.pageBtnTxtActive,
                ]}
              >
                {page}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <QuickViewModal
        product={quickViewProduct}
        visible={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onNavigate={onNavigate}
      />
    </>
  );
}


export default function Homepage() {
  const router = useRouter();

  const handleNavigate = (screen: string, params?: any) => {
    router.push(screen as any);
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <BannerSlider onNavigate={(s) => handleNavigate(s)} />

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Featured Collaboration</Text>
        <Text style={styles.sectionSubtitle}>
          Discover our exclusive collections with world-renowned artists
        </Text>
      </View>

      <ProductGrid onNavigate={(s) => handleNavigate(s)} />

      <View style={styles.featuresSection}>
        {FEATURES.map((f) => (
          <View key={f.id} style={styles.featureCard}>
            <View style={styles.featureIconWrap}>
              <Feather name={f.icon} size={28} color="#ffffff" />
            </View>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </View>
        ))}
      </View>

      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  header: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    position: "relative",
  },
  usernameTxt: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a1a",
    maxWidth: 80,
  },
  cartBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#e53e3e",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeTxt: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  mobileMenu: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingVertical: 4,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  menuItemTxt: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  userMenu: {
    position: "absolute",
    right: 16,
    top: 56,
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 200,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    overflow: "hidden",
  },
  userMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  userMenuTxt: {
    fontSize: 14,
    color: "#333",
  },

  bannerContainer: {
    position: "relative",
  },
  bannerSlide: {
    width: SCREEN_WIDTH,
    height: 320,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  bannerSubtitle: {
    fontSize: 12,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  bannerTitle: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 20,
  },
  bannerBtn: {
    borderWidth: 1.5,
    borderRadius: 0,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  bannerBtnTxt: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
  },
  dotActive: {
    backgroundColor: "#1a1a1a",
    width: 18,
  },

  sectionContainer: {
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },

  loadingWrap: {
    alignItems: "center",
    paddingVertical: 60,
    backgroundColor: "#f8f8f8",
  },
  loadingTxt: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  gridContainer: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#f8f8f8",
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: 16,
  },

  productCard: {
    width: (SCREEN_WIDTH - 36) / 2,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  productImageWrap: {
    position: "relative",
    height: 180,
    backgroundColor: "#f0f0f0",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  productImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e5e5e5",
  },
  quickViewBtn: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingVertical: 8,
    alignItems: "center",
  },
  quickViewTxt: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a1a",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 4,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingBottom: 6,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  originalPrice: {
    fontSize: 12,
    color: "#aaa",
    textDecorationLine: "line-through",
  },
  outOfStock: {
    fontSize: 11,
    color: "#e53e3e",
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  lowStock: {
    fontSize: 11,
    color: "#dd6b20",
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingBottom: 8,
  },

  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
    backgroundColor: "#f8f8f8",
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e5e5e5",
    justifyContent: "center",
    alignItems: "center",
  },
  pageBtnActive: {
    backgroundColor: "#1a1a1a",
  },
  pageBtnTxt: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },
  pageBtnTxtActive: {
    color: "#fff",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalClose: {
    alignSelf: "flex-end",
    marginBottom: 12,
  },
  modalImage: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  modalPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  modalOriginalPrice: {
    fontSize: 13,
    color: "#aaa",
    textDecorationLine: "line-through",
    marginBottom: 16,
  },
  modalViewBtn: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  modalViewBtnTxt: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.5,
  },

  featuresSection: {
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 16,
    paddingVertical: 32,
    gap: 16,
  },
  featureCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIconWrap: {
    backgroundColor: "#1a1a1a",
    borderRadius: 32,
    width: 58,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 6,
    textAlign: "center",
  },
  featureDesc: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },

  footer: {
    backgroundColor: "#111111",
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 0,
  },
  footerSection: {
    marginBottom: 28,
  },
  footerHeading: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  footerRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  footerTxt: {
    color: "#aaa",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  socialRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 4,
  },
  socialBtn: {
    padding: 4,
  },
  footerCopy: {
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
    paddingVertical: 20,
    alignItems: "center",
  },
  footerCopyTxt: {
    color: "#555",
    fontSize: 12,
    textAlign: "center",
  },
});
