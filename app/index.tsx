// app/index.tsx
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace("/mainscreen");
    } else {
      router.replace("/startscreen");
    }
  }, [user]);

  return null;
}
