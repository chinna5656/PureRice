import { router } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../src/hooks/useAuth";

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      router.replace(isAuthenticated ? "/(tabs)/mainscreen" : "/(auth)/loginscreen");
    }
  }, [loading]);

  return null;
}
