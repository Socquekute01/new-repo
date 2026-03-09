import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { Heart, X, ChevronRight, Flame } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { productAPI, categoryAPI } from "@/api";
import { useRouter } from "expo-router";

// import Header from '../../src/components/header/Header';
// import Footer from '../../src/components/footer/Footer';
// import QuickViewModal from '../../src/components/QuickViewModal';

// ─── Constants ────────────────────────────────────────────────────────────────
const PRODUCTS_PER_PAGE = 8;

const PRICE_RANGES = [
  { label: "All Prices", value: "all" },
  { label: "Under 300K", value: "0-300" },
  { label: "300K – 500K", value: "300-500" },
  { label: "500K – 1M", value: "500-1000" },
  { label: "Over 1M", value: "1000+" },
];

const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Price ↑", value: "price-asc" },
  { label: "Price ↓", value: "price-desc" },
  { label: "Name A–Z", value: "name-asc" },
  { label: "Name Z–A", value: "name-desc" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(price);

const normalizeSizes = (sizeField) => {
  if (!sizeField) return [];
  if (Array.isArray(sizeField))
    return sizeField
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean);
  if (typeof sizeField === "string")
    return sizeField
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
};

// ─── Filter Sheet ─────────────────────────────────────────────────────────────
const FilterSheet = ({
  visible,
  onClose,
  filters,
  onFilterChange,
  categories,
  availableSizes,
  sortBy,
  onSortChange,
}) => {
  const Section = ({ title, children }) => (
    <View style={fs.section}>
      <Text style={fs.sectionTitle}>{title}</Text>
      <View style={fs.chips}>{children}</View>
    </View>
  );

  const Chip = ({ label, active, onPress }) => (
    <TouchableOpacity
      style={[fs.chip, active && fs.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[fs.chipText, active && fs.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={fs.backdrop} onPress={onClose} />
      <View style={fs.sheet}>
        <View style={fs.header}>
          <Text style={fs.headerTitle}>Filter & Sort</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color="#111" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Section title="Price Range">
            {PRICE_RANGES.map((r) => (
              <Chip
                key={r.value}
                label={r.label}
                active={filters.priceRange === r.value}
                onPress={() => onFilterChange("priceRange", r.value)}
              />
            ))}
          </Section>

          {categories.length > 0 && (
            <Section title="Category">
              <Chip
                label="All"
                active={filters.category === "all"}
                onPress={() => onFilterChange("category", "all")}
              />
              {categories.map((cat) => {
                const id = cat._id || cat.id;
                return (
                  <Chip
                    key={id}
                    label={cat.name}
                    active={filters.category === id}
                    onPress={() => onFilterChange("category", id)}
                  />
                );
              })}
            </Section>
          )}

          {availableSizes.length > 0 && (
            <Section title="Size">
              <Chip
                label="All"
                active={filters.size === "all"}
                onPress={() => onFilterChange("size", "all")}
              />
              {availableSizes.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  active={filters.size === s.toLowerCase()}
                  onPress={() => onFilterChange("size", s.toLowerCase())}
                />
              ))}
            </Section>
          )}

          <Section title="Sort By">
            {SORT_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                active={sortBy === o.value}
                onPress={() => onSortChange(o.value)}
              />
            ))}
          </Section>
        </ScrollView>

        <TouchableOpacity
          style={fs.applyBtn}
          onPress={onClose}
          activeOpacity={0.85}
        >
          <Text style={fs.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const fs = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  chipActive: { backgroundColor: "#111827", borderColor: "#111827" },
  chipText: { fontSize: 13, color: "#374151" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  applyBtn: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  applyText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

// ─── Active Filter Tags ────────────────────────────────────────────────────────
const ActiveFilters = ({ filters, categories, onFilterChange, onClearAll }) => {
  const tags = [];
  if (filters.category !== "all") {
    const cat = categories.find((c) => (c._id || c.id) === filters.category);
    tags.push({ key: "category", label: cat?.name || "Category" });
  }
  if (filters.priceRange !== "all") {
    const map = {
      "0-300": "Under 300K",
      "300-500": "300K–500K",
      "500-1000": "500K–1M",
      "1000+": "Over 1M",
    };
    tags.push({ key: "priceRange", label: map[filters.priceRange] });
  }
  if (filters.size !== "all")
    tags.push({ key: "size", label: `SIZE ${filters.size.toUpperCase()}` });
  if (filters.color !== "all")
    tags.push({ key: "color", label: filters.color.toUpperCase() });

  if (tags.length === 0) return null;

  return (
    <View style={aft.container}>
      <View style={aft.row}>
        <Text style={aft.label}>Active filters</Text>
        <TouchableOpacity onPress={onClearAll}>
          <Text style={aft.clearAll}>
            Clear All <ChevronRight size={12} color="#3b82f6" />
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={aft.tags}>
          {tags.map((t) => (
            <View key={t.key} style={aft.tag}>
              <Text style={aft.tagText}>{t.label}</Text>
              <TouchableOpacity onPress={() => onFilterChange(t.key, "all")}>
                <X size={13} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const aft = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: { fontSize: 13, fontWeight: "600", color: "#3b82f6" },
  clearAll: { fontSize: 13, color: "#3b82f6", fontWeight: "500" },
  tags: { flexDirection: "row", gap: 8 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  tagText: { fontSize: 12, color: "#fff", fontWeight: "600" },
});

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({
  product,
  onPress,
  onQuickView,
  isFavorite,
  onToggleFavorite,
  cardWidth,
}) => {
  const productId = product._id || product.id;
  const productImage = product.images?.[0] || product.image;

  return (
    <TouchableOpacity
      style={[pc.card, { width: cardWidth }]}
      onPress={() => onPress(productId)}
      activeOpacity={0.9}
    >
      <View style={pc.imageWrap}>
        {productImage ? (
          <Image
            source={{ uri: productImage }}
            style={pc.image}
            resizeMode="cover"
          />
        ) : (
          <View style={pc.imagePlaceholder} />
        )}

        {product.totalSold > 0 && (
          <View style={pc.badge}>
            <Flame size={11} color="#fff" />
            <Text style={pc.badgeText}>{product.totalSold} sold</Text>
          </View>
        )}

        <TouchableOpacity
          style={pc.heartBtn}
          onPress={() => onToggleFavorite(productId)}
          activeOpacity={0.8}
        >
          <Heart
            size={18}
            color={isFavorite ? "#ef4444" : "#9ca3af"}
            fill={isFavorite ? "#ef4444" : "none"}
          />
        </TouchableOpacity>

        <View style={pc.overlay}>
          <TouchableOpacity
            style={pc.overlayBtnLight}
            onPress={() => onPress(productId)}
            activeOpacity={0.8}
          >
            <Text style={pc.overlayBtnLightText}>View Detail</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={pc.overlayBtnDark}
            onPress={() => onQuickView(product)}
            activeOpacity={0.8}
          >
            <Text style={pc.overlayBtnDarkText}>Quick View</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={pc.name} numberOfLines={2}>
        {product.name}
      </Text>
      <View style={pc.priceRow}>
        <Text style={pc.price}>{formatPrice(product.price)}</Text>
        {product.originalPrice > product.price && (
          <Text style={pc.originalPrice}>
            {formatPrice(product.originalPrice)}
          </Text>
        )}
      </View>
      {product.stock <= 0 && <Text style={pc.outOfStock}>Out of Stock</Text>}
    </TouchableOpacity>
  );
};

const pc = StyleSheet.create({
  card: { marginBottom: 20 },
  imageWrap: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    overflow: "hidden",
    height: 200,
    marginBottom: 10,
  },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { flex: 1, backgroundColor: "#e5e7eb" },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#ef4444",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  heartBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 6,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  overlayBtnLight: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: "center",
  },
  overlayBtnLightText: { fontSize: 11, fontWeight: "700", color: "#111" },
  overlayBtnDark: {
    flex: 1,
    backgroundColor: "#111",
    borderWidth: 1.5,
    borderColor: "#fff",
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: "center",
  },
  overlayBtnDarkText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    lineHeight: 18,
  },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  price: { fontSize: 15, fontWeight: "700", color: "#111827" },
  originalPrice: {
    fontSize: 12,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  outOfStock: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "600",
    marginTop: 4,
  },
});

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={pag.container}
    >
      <TouchableOpacity
        style={[pag.btn, currentPage === 1 && pag.btnDisabled]}
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Text style={pag.btnText}>‹</Text>
      </TouchableOpacity>
      {pages.map((p) => (
        <TouchableOpacity
          key={p}
          style={[pag.btn, p === currentPage && pag.btnActive]}
          onPress={() => onPageChange(p)}
        >
          <Text style={[pag.btnText, p === currentPage && pag.btnTextActive]}>
            {p}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[pag.btn, currentPage === totalPages && pag.btnDisabled]}
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <Text style={pag.btnText}>›</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const pag = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  btnActive: { backgroundColor: "#111827", borderColor: "#111827" },
  btnDisabled: { opacity: 0.35 },
  btnText: { fontSize: 14, color: "#374151", fontWeight: "600" },
  btnTextActive: { color: "#fff" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function BestSeller() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("default");
  const [filters, setFilters] = useState({
    priceRange: "all",
    category: "all",
    size: "all",
    color: "all",
  });

  const COLUMNS = width >= 640 ? 3 : 2;
  const GAP = 12;
  const cardWidth = (width - 32 - GAP * (COLUMNS - 1)) / COLUMNS;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          productAPI.getBestSellers(20),
          categoryAPI.getAll(),
        ]);
        setProducts(productsData || []);
        setCategories(categoriesData?.data || categoriesData || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleFilterChange = useCallback((name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  }, []);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const availableSizes = [
    ...new Set(
      products.filter((p) => p.size).flatMap((p) => normalizeSizes(p.size)),
    ),
  ].sort();

  const filteredProducts = products.filter((p) => {
    if (filters.priceRange !== "all") {
      const price = p.price;
      if (filters.priceRange === "0-300" && price >= 300000) return false;
      if (
        filters.priceRange === "300-500" &&
        (price < 300000 || price >= 500000)
      )
        return false;
      if (
        filters.priceRange === "500-1000" &&
        (price < 500000 || price >= 1000000)
      )
        return false;
      if (filters.priceRange === "1000+" && price < 1000000) return false;
    }
    if (
      filters.category !== "all" &&
      (p.category?._id || p.category) !== filters.category
    )
      return false;
    if (filters.size !== "all") {
      const sizes = normalizeSizes(p.size).map((s) => s.toLowerCase());
      if (!sizes.includes(filters.size)) return false;
    }
    if (filters.color !== "all") {
      if (
        !`${p.name} ${p.description || ""}`
          .toLowerCase()
          .includes(filters.color)
      )
        return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);
    return 0;
  });

  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  const hasActiveFilters = Object.values(filters).some((v) => v !== "all");

  return (
    <View style={s.container}>
      {/* <Header /> */}

      <FlatList
        data={currentProducts}
        keyExtractor={(item) => String(item._id || item.id)}
        numColumns={COLUMNS}
        columnWrapperStyle={COLUMNS > 1 ? { gap: GAP } : undefined}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Banner */}
            <View style={s.hero}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
                }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
              <View style={s.heroOverlay} />
              <Text style={s.heroTitle}>BEST SELLERS</Text>
              <Text style={s.heroSub}>
                Top Rated Products · {sortedProducts.length} items
              </Text>
            </View>

            {/* Filter Bar */}
            <View style={s.filterBar}>
              <TouchableOpacity
                style={[s.filterBtn, hasActiveFilters && s.filterBtnActive]}
                onPress={() => setFilterSheetVisible(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    s.filterBtnText,
                    hasActiveFilters && s.filterBtnTextActive,
                  ]}
                >
                  {hasActiveFilters ? "● Filters On" : "Filter & Sort"}
                </Text>
              </TouchableOpacity>
              {sortBy !== "default" && (
                <View style={s.sortIndicator}>
                  <Text style={s.sortIndicatorText}>
                    {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                  </Text>
                </View>
              )}
            </View>

            {/* Active filter tags */}
            {hasActiveFilters && (
              <ActiveFilters
                filters={filters}
                categories={categories}
                onFilterChange={handleFilterChange}
                onClearAll={() => {
                  setFilters({
                    priceRange: "all",
                    category: "all",
                    size: "all",
                    color: "all",
                  });
                  setCurrentPage(1);
                }}
              />
            )}

            {loading && (
              <View style={s.loading}>
                <ActivityIndicator size="large" color="#111827" />
                <Text style={s.loadingText}>Loading products...</Text>
              </View>
            )}
          </>
        }
        ListFooterComponent={
          !loading && (
            <>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
              {sortedProducts.length === 0 && (
                <View style={s.empty}>
                  <Text style={s.emptyText}>No best sellers found</Text>
                </View>
              )}
            </>
          )
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            cardWidth={cardWidth}
            isFavorite={favorites.has(item._id || item.id)}
            onToggleFavorite={toggleFavorite}
            onPress={(id) => router.push("/product/" + id)}
            onQuickView={setQuickViewProduct}
          />
        )}
      />

      {/* Filter Sheet */}
      <FilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        categories={categories}
        availableSizes={availableSizes}
        sortBy={sortBy}
        onSortChange={(v) => {
          setSortBy(v);
          setCurrentPage(1);
        }}
      />

      {/* Quick View Modal — swap with your QuickViewModal component */}
      <Modal
        visible={!!quickViewProduct}
        animationType="slide"
        transparent
        onRequestClose={() => setQuickViewProduct(null)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setQuickViewProduct(null)}
        />
        <View style={s.quickView}>
          <View style={s.quickViewHeader}>
            <Text style={s.quickViewTitle} numberOfLines={1}>
              {quickViewProduct?.name}
            </Text>
            <TouchableOpacity onPress={() => setQuickViewProduct(null)}>
              <X size={22} color="#111" />
            </TouchableOpacity>
          </View>
          {quickViewProduct?.images?.[0] && (
            <Image
              source={{ uri: quickViewProduct.images[0] }}
              style={s.quickViewImage}
              resizeMode="cover"
            />
          )}
          <Text style={s.quickViewPrice}>
            {quickViewProduct && formatPrice(quickViewProduct.price)}
          </Text>
          <TouchableOpacity
            style={s.quickViewBtn}
            onPress={() => {
              const id = quickViewProduct?._id || quickViewProduct?.id;
              setQuickViewProduct(null);
              navigation.navigate("product/" + id, { productId: id });
            }}
          >
            <Text style={s.quickViewBtnText}>View Full Detail</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* <Footer /> */}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },

  // Hero
  hero: {
    height: 220,
    marginHorizontal: -16,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 2,
  },
  heroSub: { fontSize: 14, color: "#e5e7eb", marginTop: 6 },

  // Filter bar
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  filterBtnActive: { backgroundColor: "#111827", borderColor: "#111827" },
  filterBtnText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  filterBtnTextActive: { color: "#fff" },
  sortIndicator: {
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  sortIndicatorText: { fontSize: 12, color: "#6b7280", fontWeight: "500" },

  // Loading / empty
  loading: { paddingVertical: 48, alignItems: "center", gap: 12 },
  loadingText: { color: "#6b7280", fontSize: 14 },
  empty: { paddingVertical: 48, alignItems: "center" },
  emptyText: { fontSize: 15, color: "#6b7280" },

  // Quick view
  quickView: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  quickViewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  quickViewTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    marginRight: 12,
  },
  quickViewImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 14,
  },
  quickViewPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
  },
  quickViewBtn: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  quickViewBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
