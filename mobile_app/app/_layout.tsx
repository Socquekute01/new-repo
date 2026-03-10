import Header from "@/components/layout/Header";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Slot } from "expo-router";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <View style={{ flex: 1 }}>
            <Header />
            <View style={{ flex: 1 }}>
              <Slot />
            </View>
          </View>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
