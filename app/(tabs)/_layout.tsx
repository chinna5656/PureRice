import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../../src/hooks/useAuth";

export default function AppLayout() {
  const { isAuthenticated, loading } = useAuth();

  // useEffect(() => {
  //   if (!loading && !isAuthenticated) {
  //     router.replace("/loginscreen");
  //   }
  // }, [loading, isAuthenticated]);

  if (loading) return null;

  return (
    //<Stack screenOptions={{ headerShown: false }}>
    <Stack >
      <Stack.Screen name="mainscreen" options={{ headerShown: false }} />
      <Stack.Screen name="profilescreen" options={{ headerShown: false }} />
    </Stack>
  );
}
