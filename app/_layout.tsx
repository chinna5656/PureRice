// app/_layout.tsx
import { Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { View, ActivityIndicator } from "react-native";

SplashScreen.preventAutoHideAsync(); // แสดง Splash จนกว่าเราจะสั่งให้ปิด

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      const publicRoutes = ["startscreen", "registerscreen", "loginscreen"];
      const currentSegment = segments[0];
      const inPublicRoute = publicRoutes.includes(currentSegment);

      if (!user && !inPublicRoute) {
        router.replace("/startscreen");
      } else if (user && inPublicRoute) {
        router.replace("/mainscreen");
      }

      // ✅ แสดงหน้าหลัง redirect เสร็จ
      setAppReady(true);
      SplashScreen.hideAsync().catch(console.warn);
    }
  }, [user, segments, loading]);

  // ✅ แสดง loading จนกว่าจะ redirect เสร็จ
  if (!appReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}

export default function Layout() {
  return (
    <AuthProvider>
      <ProtectedRoute />
    </AuthProvider>
  );
}
