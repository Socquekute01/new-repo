import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, onLogout } = useAuth();
  const { getCartItemsCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const cartCount = getCartItemsCount();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuItems = ["SHOP", "CONTACT", "ABOUT US", "BEST SELLER"];
  const onNavigate = (screen: string, params?: any) => {
    router.push("/" + screen);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onNavigate("shop", { search: searchQuery.trim() });
      setSearchQuery("");
    }
  };

  return (
    <View style={styles.header}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Main Row */}
      <View style={styles.headerRow}>
        {/* Logo */}
        <TouchableOpacity onPress={() => onNavigate("home")}>
          <Image
            source={{
              uri: "https://via.placeholder.com/56x56/000000/ffffff?text=NOW",
            }}
            style={styles.logo}
          />
        </TouchableOpacity>

        {/* Right Icons */}
        <View style={styles.headerIcons}>
          {/* User */}
          {user ? (
            <TouchableOpacity
              onPress={() => setUserMenuOpen(!userMenuOpen)}
              style={styles.iconBtn}
            >
              <Feather name="user" size={22} color="#1a1a1a" />
              <Text style={styles.usernameTxt} numberOfLines={1}>
                {user.username}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => onNavigate("auth")}
              style={styles.iconBtn}
            >
              <Feather name="user" size={22} color="#1a1a1a" />
            </TouchableOpacity>
          )}

          {/* Cart */}
          <TouchableOpacity
            onPress={() => onNavigate("cart")}
            style={styles.iconBtn}
          >
            <Feather name="shopping-bag" size={22} color="#1a1a1a" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeTxt}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Hamburger */}
          <TouchableOpacity
            onPress={() => setMenuOpen(!menuOpen)}
            style={styles.iconBtn}
          >
            <Feather name={menuOpen ? "x" : "menu"} size={24} color="#1a1a1a" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search..."
          placeholderTextColor="#999"
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleSearch}>
          <Feather name="search" size={18} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      {menuOpen && (
        <View style={styles.mobileMenu}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => {
                onNavigate(item.toLowerCase().replace(" ", ""));
                setMenuOpen(false);
              }}
              style={styles.menuItem}
            >
              <Text style={styles.menuItemTxt}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* User Dropdown */}
      {userMenuOpen && user && (
        <View style={styles.userMenu}>
          <TouchableOpacity
            style={styles.userMenuItem}
            onPress={() => {
              onNavigate("profile");
              setUserMenuOpen(false);
            }}
          >
            <Feather name="user" size={16} color="#333" />
            <Text style={styles.userMenuTxt}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.userMenuItem,
              { borderTopWidth: 1, borderTopColor: "#f0f0f0" },
            ]}
            onPress={() => {
              onLogout?.();
              setUserMenuOpen(false);
            }}
          >
            <Feather name="log-out" size={16} color="#e53e3e" />
            <Text style={[styles.userMenuTxt, { color: "#e53e3e" }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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

  // ── Header
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

  // ── Banner
  bannerContainer: {
    position: "relative",
  },
  bannerSlide: {
    width: SCREEN_WIDTH,
    height: 220,
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

  // ── Section Header
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

  // ── Product Grid
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

  // ── Product Card
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

  // ── Pagination
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

  // ── Quick View Modal
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

  // ── Features
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

  // ── Footer
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
