import Header from "@/components/layout/Header";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Slot, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [user] = useState({ username: "JohnDoe" });
  
 

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <View style={{ flex: 1 }}>
            <Header />
            <View style={{ flex: 1 }}>
              <Slot /> {/* tự render màn hình hiện tại */}
            </View>
          </View>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
