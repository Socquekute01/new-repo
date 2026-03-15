import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { vnpayAPI } from "@/api";

interface VnpayResponse {
  isVerified: boolean;
  isSuccess: boolean;
  message?: string;
  orderId?: string;
}

interface State {
  loading: boolean;
  error: string | null;
  data: VnpayResponse | null;
}

const VnpayReturn = () => {
  const params = useLocalSearchParams<{ [key: string]: string }>();
  const router = useRouter();
  const { clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const hasParams = Object.keys(params).length > 0;
  const successHandledRef = useRef(false);

  const [state, setState] = useState<State>({
    loading: hasParams,
    error: hasParams ? null : "Thiếu tham số trả về từ VNPay.",
    data: null,
  });

  useEffect(() => {
    if (!hasParams) return;

    let isActive = true;

    vnpayAPI
      .verifyReturn(params)
      .then(async (data: VnpayResponse) => {
        if (!isActive) return;
        setState({ loading: false, error: null, data });

        if (data?.isVerified && data?.isSuccess && !successHandledRef.current) {
          successHandledRef.current = true;

          try {
            const userId = user?.id || user?._id;
            if (isAuthenticated && userId) {
              const cartKey = `cart_${userId}`;
              await AsyncStorage.setItem(cartKey, JSON.stringify([]));
            } else {
              await AsyncStorage.setItem("cart_guest", JSON.stringify([]));
            }
          } catch (e) {
            console.error("Failed to clear storage:", e);
          }
          clearCart();
        }
      })
      .catch((error: any) => {
        if (!isActive) return;
        const message =
          error.response?.data?.message || "Không thể xác minh giao dịch.";
        setState({ loading: false, error: message, data: null });
      });

    return () => {
      isActive = false;
    };
  }, [hasParams]);

  const isSuccess = !!(state.data?.isVerified && state.data?.isSuccess);

  const getTitle = () => {
    if (state.loading) return "Đang xác minh...";
    if (state.error) return "Xác minh thất bại";
    return isSuccess ? "Thanh toán thành công" : "Thanh toán chưa thành công";
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.card}>
        <View
          style={[
            styles.header,
            isSuccess ? styles.headerSuccess : styles.headerError,
          ]}
        >
          {state.loading ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <Text style={styles.headerTitle}>{getTitle()}</Text>
          )}
        </View>

        <View style={styles.body}>
          {state.loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.statusText}>
                Vui lòng chờ trong giây lát để hệ thống xác minh giao dịch.
              </Text>
            </View>
          )}

          {state.error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{state.error}</Text>
            </View>
          )}

          {!state.loading && !state.error && state.data && (
            <View style={styles.infoContainer}>
              <View style={styles.statusBox}>
                <Text style={styles.messageText}>
                  {state.data.message || "Giao dịch đã được xử lý."}
                </Text>
              </View>

              {state.data.orderId && (
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Mã đơn hàng</Text>
                  <Text style={styles.code}>{state.data.orderId}</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.label}>Trạng thái</Text>
                <View
                  style={[
                    styles.badge,
                    state.data.isVerified
                      ? styles.badgeSuccess
                      : styles.badgeInfo,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {state.data.isVerified ? "HỢP LỆ" : "KHÔNG HỢP LỆ"}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push(isSuccess ? "/order" : ("/cart" as any))}
          >
            <Text style={styles.primaryButtonText}>
              {isSuccess ? "XEM ĐƠN HÀNG" : "QUAY LẠI GIỎ HÀNG"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/" as any)}
          >
            <Text style={styles.secondaryButtonText}>VỀ TRANG CHỦ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!state.loading && (
        <TouchableOpacity
          style={styles.helpContainer}
          onPress={() => router.push("/contact" as any)}
        >
          <Text style={styles.helpText}>
            Nếu có thắc mắc, vui lòng liên hệ{" "}
            <Text style={styles.underline}>hỗ trợ khách hàng</Text>
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  contentContainer: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 80 : 60,
    alignItems: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSuccess: {
  },
  headerError: {
    backgroundColor: "#ef4444",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  body: {
    padding: 24,
  },
  loadingContainer: {
    alignItems: "center",
    gap: 12,
  },
  statusText: {
    fontSize: 15,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 22,
  },
  errorBox: {
    borderLeftWidth: 4,
    borderLeftColor: "#000",
    backgroundColor: "#fef2f2",
    padding: 16,
  },
  errorText: {
    color: "#b91c1c",
    fontWeight: "600",
    fontSize: 14,
  },
  infoContainer: {
    gap: 20,
  },
  statusBox: {
    borderLeftWidth: 4,
    borderLeftColor: "#000",
    backgroundColor: "#f9fafb",
    padding: 16,
  },
  messageText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "500",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  label: {
    color: "#6b7280",
    fontSize: 14,
  },
  code: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
  },
  badgeSuccess: {
    backgroundColor: "#000",
  },
  badgeInfo: {
    backgroundColor: "#9ca3af",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 1,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 1,
  },
  helpContainer: {
    marginTop: 24,
    paddingBottom: 40,
  },
  helpText: {
    color: "#6b7280",
    fontSize: 13,
    textAlign: "center",
  },
  underline: {
    textDecorationLine: "underline",
    color: "#000",
    fontWeight: "600",
  },
});

export default VnpayReturn;
