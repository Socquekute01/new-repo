import Footer from "@/components/layout/Footer";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_PRODUCTS = [
  {
    _id: "1",
    name: "Classic Black Tee",
    price: 250000,
    originalPrice: 350000,
    images: ["https://via.placeholder.com/300/111/fff?text=Tee"],
    stock: 10,
    size: "S, M, L",
    category: { _id: "cat1" },
    description: "black classic tee",
  },
  {
    _id: "2",
    name: "Limited Hoodie",
    price: 850000,
    images: ["https://via.placeholder.com/300/222/fff?text=Hoodie"],
    stock: 3,
    size: "M, L, XL",
    category: { _id: "cat2" },
    description: "white hoodie limited",
  },
  {
    _id: "3",
    name: "Graphic Shirt",
    price: 450000,
    originalPrice: 600000,
    images: ["https://via.placeholder.com/300/333/fff?text=Shirt"],
    stock: 0,
    size: "S, M",
    category: { _id: "cat1" },
    description: "navy graphic shirt",
  },
  {
    _id: "4",
    name: "Vintage Pants",
    price: 1200000,
    images: ["https://via.placeholder.com/300/444/fff?text=Pants"],
    stock: 7,
    size: "M, L",
    category: { _id: "cat2" },
    description: "grey vintage pants",
  },
  {
    _id: "5",
    name: "Drop Shoulder Tee",
    price: 320000,
    images: ["https://via.placeholder.com/300/555/fff?text=Drop+Tee"],
    stock: 2,
    size: "L, XL",
    category: { _id: "cat1" },
    description: "black drop shoulder",
  },
  {
    _id: "6",
    name: "Cargo Shorts",
    price: 680000,
    images: ["https://via.placeholder.com/300/666/fff?text=Cargo"],
    stock: 15,
    size: "S, M, L, XL",
    category: { _id: "cat2" },
    description: "black cargo shorts",
  },
];
const MOCK_CATEGORIES = [
  { _id: "cat1", name: "T-Shirts" },
  { _id: "cat2", name: "Bottoms" },
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

const PRICE_RANGES = [
  { label: "All Price", value: "all" },
  { label: "Under 300K", value: "0-300" },
  { label: "300K - 500K", value: "300-500" },
  { label: "500K - 1M", value: "500-1000" },
  { label: "Over 1M", value: "1000+" },
];

const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Name: A-Z", value: "name-asc" },
  { label: "Name: Z-A", value: "name-desc" },
];

const PRODUCTS_PER_PAGE = 8;

// ─── FILTER BOTTOM SHEET ──────────────────────────────────────────────────────
function FilterSheet({
  visible,
  onClose,
  filters,
  setFilters,
  sortBy,
  setSortBy,
  categories,
  availableSizes,
}: any) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [localSort, setLocalSort] = useState(sortBy);

  useEffect(() => {
    setLocalFilters(filters);
    setLocalSort(sortBy);
  }, [visible]);

  const apply = () => {
    setFilters(localFilters);
    setSortBy(localSort);
    onClose();
  };
  const reset = () => {
    setLocalFilters({ priceRange: "all", category: "all", size: "all" });
    setLocalSort("default");
  };

  const Chip = ({ label, active, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.sheetOverlay}>
        <View style={styles.sheetCard}>
          {/* Handle */}
          <View style={styles.sheetHandle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filter & Sort</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={22} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Sort */}
            <Text style={styles.filterLabel}>Sort By</Text>
            <View style={styles.chipsRow}>
              {SORT_OPTIONS.map((o) => (
                <Chip
                  key={o.value}
                  label={o.label}
                  active={localSort === o.value}
                  onPress={() => setLocalSort(o.value)}
                />
              ))}
            </View>

            {/* Price */}
            <Text style={styles.filterLabel}>Price Range</Text>
            <View style={styles.chipsRow}>
              {PRICE_RANGES.map((o) => (
                <Chip
                  key={o.value}
                  label={o.label}
                  active={localFilters.priceRange === o.value}
                  onPress={() =>
                    setLocalFilters((p: any) => ({ ...p, priceRange: o.value }))
                  }
                />
              ))}
            </View>

            {/* Category */}
            <Text style={styles.filterLabel}>Category</Text>
            <View style={styles.chipsRow}>
              <Chip
                label="All"
                active={localFilters.category === "all"}
                onPress={() =>
                  setLocalFilters((p: any) => ({ ...p, category: "all" }))
                }
              />
              {categories.map((cat: any) => (
                <Chip
                  key={cat._id}
                  label={cat.name}
                  active={localFilters.category === (cat._id || cat.id)}
                  onPress={() =>
                    setLocalFilters((p: any) => ({
                      ...p,
                      category: cat._id || cat.id,
                    }))
                  }
                />
              ))}
            </View>

            {/* Size */}
            {availableSizes.length > 0 && (
              <>
                <Text style={styles.filterLabel}>Size</Text>
                <View style={styles.chipsRow}>
                  <Chip
                    label="All"
                    active={localFilters.size === "all"}
                    onPress={() =>
                      setLocalFilters((p: any) => ({ ...p, size: "all" }))
                    }
                  />
                  {availableSizes.map((s: string) => (
                    <Chip
                      key={s}
                      label={s.toUpperCase()}
                      active={localFilters.size === s.toLowerCase()}
                      onPress={() =>
                        setLocalFilters((p: any) => ({
                          ...p,
                          size: s.toLowerCase(),
                        }))
                      }
                    />
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.sheetFooter}>
            <TouchableOpacity onPress={reset} style={styles.resetBtn}>
              <Text style={styles.resetBtnTxt}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={apply} style={styles.applyBtn}>
              <Text style={styles.applyBtnTxt}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── ACTIVE FILTER TAGS ───────────────────────────────────────────────────────
function ActiveFilterTags({ filters, setFilters, categories }: any) {
  const tags = [];

  if (filters.category !== "all") {
    const cat = categories.find(
      (c: any) => (c._id || c.id) === filters.category,
    );
    tags.push({ key: "category", label: cat?.name || "Category" });
  }
  if (filters.priceRange !== "all") {
    const map: any = {
      "0-300": "Under 300K",
      "300-500": "300K-500K",
      "500-1000": "500K-1M",
      "1000+": "Over 1M",
    };
    tags.push({ key: "priceRange", label: map[filters.priceRange] });
  }
  if (filters.size !== "all")
    tags.push({ key: "size", label: `SIZE ${filters.size.toUpperCase()}` });

  if (tags.length === 0) return null;

  return (
    <View style={styles.activeTags}>
      <View style={styles.activeTagsHeader}>
        <Text style={styles.activeTagsTitle}>You chose</Text>
        <TouchableOpacity
          onPress={() =>
            setFilters({ priceRange: "all", category: "all", size: "all" })
          }
        >
          <Text style={styles.clearAllTxt}>Clear all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {tags.map((tag) => (
          <View key={tag.key} style={styles.activeTag}>
            <Text style={styles.activeTagTxt}>{tag.label}</Text>
            <TouchableOpacity
              onPress={() =>
                setFilters((p: any) => ({ ...p, [tag.key]: "all" }))
              }
            >
              <Feather name="x" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ product, onPress, onQuickView }: any) {
  const productId = product._id || product.id;
  const productImage = product.images?.[0] || product.image;

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => onPress(productId)}
      activeOpacity={0.9}
    >
      <View style={styles.productImageWrap}>
        {productImage ? (
          <Image source={{ uri: productImage }} style={styles.productImage} />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Feather name="shopping-bag" size={32} color="#ccc" />
          </View>
        )}
        {product.stock <= 0 && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockOverlayTxt}>Hết hàng</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.quickViewBtn}
          onPress={() => onQuickView(product)}
        >
          <Text style={styles.quickViewTxt}>Quick View</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productInfo}>
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
        {product.stock > 0 && product.stock < 5 && (
          <Text style={styles.lowStock}>Only {product.stock} left</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── QUICK VIEW MODAL ─────────────────────────────────────────────────────────
function QuickViewModal({ product, visible, onClose, onNavigate }: any) {
  if (!product) return null;
  const productId = product._id || product.id;
  const productImage = product.images?.[0];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
            <Feather name="x" size={22} color="#333" />
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
          {product.originalPrice > product.price && (
            <Text style={styles.modalOriginal}>
              {formatPrice(product.originalPrice)}
            </Text>
          )}
          <TouchableOpacity
            style={styles.modalViewBtn}
            onPress={() => {
              onClose();
              onNavigate(productId);
            }}
          >
            <Text style={styles.modalViewBtnTxt}>View Full Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── MAIN SHOP SCREEN ─────────────────────────────────────────────────────────
export default function ShopScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ search?: string }>();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(params.search || "");
  const [filterVisible, setFilterVisible] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    priceRange: "all",
    category: "all",
    size: "all",
  });
  const [sortBy, setSortBy] = useState("default");

  // Sync search param from URL
  useEffect(() => {
    setSearchQuery(params.search || "");
    setCurrentPage(1);
  }, [params.search]);

  useEffect(() => {
    // Replace with real API:
    // const data = await productAPI.getAll();
    // const cats = await categoryAPI.getAll();
    setTimeout(() => {
      setProducts(MOCK_PRODUCTS);
      setCategories(MOCK_CATEGORIES);
      setLoading(false);
    }, 700);
  }, []);

  const handleFilterChange = useCallback((updated: any) => {
    setFilters(updated);
    setCurrentPage(1);
  }, []);

  // Available sizes
  const availableSizes = [
    ...new Set(products.flatMap((p) => normalizeSizes(p.size))),
  ].sort();

  // Filter
  const filteredProducts = products.filter((product) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !product.name.toLowerCase().includes(q) &&
        !product.description?.toLowerCase().includes(q)
      )
        return false;
    }
    if (filters.priceRange !== "all") {
      const price = product.price;
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
    if (filters.category !== "all") {
      const productCategory = product.category?._id || product.category;
      if (productCategory !== filters.category) return false;
    }
    if (filters.size !== "all") {
      const sizes = normalizeSizes(product.size).map((s) => s.toLowerCase());
      if (!sizes.includes(filters.size.toLowerCase())) return false;
    }
    return true;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  const hasActiveFilters =
    filters.priceRange !== "all" ||
    filters.category !== "all" ||
    filters.size !== "all";
  const activeFilterCount = [
    filters.priceRange,
    filters.category,
    filters.size,
  ].filter((v) => v !== "all").length;

  return (
    <View style={styles.container}>
      <FlatList
        data={currentProducts}
        keyExtractor={(item) => item._id || item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Banner */}
            <View style={styles.banner}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=70",
                }}
                style={styles.bannerImage}
              />
              <View style={styles.bannerOverlay} />
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>
                  {searchQuery ? "Search Results" : "SHOP"}
                </Text>
                <Text style={styles.bannerSubtitle}>
                  {searchQuery
                    ? `"${searchQuery}" — ${sortedProducts.length} products`
                    : `${sortedProducts.length} products`}
                </Text>
              </View>
            </View>

            {/* Toolbar */}
            <View style={styles.toolbar}>
              {/* Search */}
              <View style={styles.searchBar}>
                <Feather name="search" size={16} color="#999" />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={(t) => {
                    setSearchQuery(t);
                    setCurrentPage(1);
                  }}
                  placeholder="Search products..."
                  placeholderTextColor="#aaa"
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Feather name="x" size={16} color="#999" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filter Button */}
              <TouchableOpacity
                onPress={() => setFilterVisible(true)}
                style={styles.filterBtn}
              >
                <Feather name="sliders" size={16} color="#fff" />
                <Text style={styles.filterBtnTxt}>Filter</Text>
                {activeFilterCount > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeTxt}>
                      {activeFilterCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Active Filter Tags */}
            {hasActiveFilters && (
              <ActiveFilterTags
                filters={filters}
                setFilters={handleFilterChange}
                categories={categories}
              />
            )}

            {/* Loading */}
            {loading && (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color="#1a1a1a" />
                <Text style={styles.loadingTxt}>Loading products...</Text>
              </View>
            )}

            {/* Empty */}
            {!loading && sortedProducts.length === 0 && (
              <View style={styles.emptyWrap}>
                <Feather name="inbox" size={48} color="#ccc" />
                <Text style={styles.emptyTxt}>No products found</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={(id: string) => router.push(`/product/${id}`)}
            onQuickView={setQuickViewProduct}
          />
        )}
        ListFooterComponent={
          <>
            {totalPages > 1 ? (
              <View style={styles.paginationRow}>
                <TouchableOpacity
                  onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={[
                    styles.pageNavBtn,
                    currentPage === 1 && styles.pageNavBtnDisabled,
                  ]}
                >
                  <Feather
                    name="chevron-left"
                    size={18}
                    color={currentPage === 1 ? "#ccc" : "#1a1a1a"}
                  />
                </TouchableOpacity>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
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
                  ),
                )}

                <TouchableOpacity
                  onPress={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  style={[
                    styles.pageNavBtn,
                    currentPage === totalPages && styles.pageNavBtnDisabled,
                  ]}
                >
                  <Feather
                    name="chevron-right"
                    size={18}
                    color={currentPage === totalPages ? "#ccc" : "#1a1a1a"}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ height: 24 }} />
            )}
            <Footer />
          </>
        }
      />

      {/* Filter Bottom Sheet */}
      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        filters={filters}
        setFilters={handleFilterChange}
        sortBy={sortBy}
        setSortBy={(v: string) => {
          setSortBy(v);
          setCurrentPage(1);
        }}
        categories={categories}
        availableSizes={availableSizes}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        visible={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onNavigate={(id: string) => router.push(`/product/${id}`)}
      />
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Banner
  banner: { height: 200, position: "relative" },
  bannerImage: { width: "100%", height: "100%", resizeMode: "cover" },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  bannerContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  bannerTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2,
    textAlign: "center",
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 6,
    textAlign: "center",
  },

  // Toolbar
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 6,
  },
  filterBtnTxt: { color: "#fff", fontSize: 13, fontWeight: "600" },
  filterBadge: {
    backgroundColor: "#e53e3e",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeTxt: { color: "#fff", fontSize: 10, fontWeight: "700" },

  // Active Tags
  activeTags: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activeTagsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  activeTagsTitle: { fontSize: 13, fontWeight: "700", color: "#2563eb" },
  clearAllTxt: { fontSize: 13, color: "#2563eb", fontWeight: "500" },
  activeTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  activeTagTxt: { color: "#fff", fontSize: 12, fontWeight: "600" },

  // Grid
  gridContent: { paddingBottom: 20 },
  gridRow: {
    paddingHorizontal: 16,
    justifyContent: "space-between",
    marginBottom: 16,
  },

  // Product Card
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  productImageWrap: {
    height: 190,
    position: "relative",
    backgroundColor: "#f0f0f0",
  },
  productImage: { width: "100%", height: "100%", resizeMode: "cover" },
  productImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockOverlayTxt: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  quickViewBtn: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingVertical: 7,
    alignItems: "center",
  },
  quickViewTxt: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  productInfo: { padding: 10 },
  productName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1a1a1a",
    lineHeight: 17,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  productPrice: { fontSize: 13, fontWeight: "800", color: "#1a1a1a" },
  originalPrice: {
    fontSize: 11,
    color: "#aaa",
    textDecorationLine: "line-through",
  },
  lowStock: { fontSize: 11, color: "#dd6b20", fontWeight: "600", marginTop: 3 },

  // Pagination
  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 6,
  },
  pageBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  pageBtnActive: { backgroundColor: "#1a1a1a" },
  pageBtnTxt: { fontSize: 13, fontWeight: "600", color: "#555" },
  pageBtnTxtActive: { color: "#fff" },
  pageNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  pageNavBtnDisabled: { opacity: 0.35 },

  // Loading / Empty
  loadingWrap: { alignItems: "center", paddingVertical: 60 },
  loadingTxt: { marginTop: 12, color: "#666", fontSize: 14 },
  emptyWrap: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTxt: { fontSize: 16, color: "#999" },

  // Filter Sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheetCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sheetTitle: { fontSize: 17, fontWeight: "700", color: "#1a1a1a" },
  filterLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipActive: { backgroundColor: "#1a1a1a", borderColor: "#1a1a1a" },
  chipTxt: { fontSize: 13, color: "#555", fontWeight: "500" },
  chipTxtActive: { color: "#fff", fontWeight: "600" },
  sheetFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  resetBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
  },
  resetBtnTxt: { fontSize: 14, fontWeight: "600", color: "#555" },
  applyBtn: {
    flex: 2,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
  },
  applyBtnTxt: { fontSize: 14, fontWeight: "700", color: "#fff" },

  // Quick View Modal
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
    paddingBottom: Platform.OS === "ios" ? 44 : 28,
  },
  modalCloseBtn: { alignSelf: "flex-end", marginBottom: 12 },
  modalImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 14,
  },
  modalName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  modalPrice: { fontSize: 15, fontWeight: "800", color: "#1a1a1a" },
  modalOriginal: {
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
    marginTop: 14,
  },
  modalViewBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
