import Header from "@/components/layout/Header";
import { Slot } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [cartCount] = useState(2);
  const [user] = useState({ username: "JohnDoe" });
  const handleNavigate = (screen: string, params?: any) => {
    // navigation.navigate(screen, params);
    console.log("Navigate to:", screen, params);
  };
  const handleLogout = () => {
    console.log("Logout");
  };

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <Header
          cartCount={cartCount}
          user={user}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
        <View style={{ flex: 1 }}>
          <Slot /> {/* tự render màn hình hiện tại */}
        </View>
      </View>
    </SafeAreaProvider>
  );
}
