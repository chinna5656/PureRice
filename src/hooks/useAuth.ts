import axios from "axios";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { API_URL } from "../services/api";
import { deleteLoggedIn, deleteToken, getLoggedIn, getToken, saveLoggedIn, saveToken } from "../services/storage/secureStore";

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 โหลด token ตอนเปิดแอป
  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await getToken();
      const loggedIn = await getLoggedIn();
      if (storedToken && loggedIn === "true") {
        setToken(storedToken);
      }
      setLoading(false);
    };
    loadToken();
  }, []);

  // 🔹 Login
  const login = async (username: string, password: string) => {
    const form = new FormData();
    form.append("username", username);
    form.append("password", password);

    const res = await axios.post(`${API_URL}/token`, form);
    await saveToken(res.data.access_token);
    await saveLoggedIn("true");
    setToken(res.data.access_token);
  };


  // 🔹 Logout
  const logout = async () => {
    await deleteToken();
    await deleteLoggedIn();
    setToken(null);
    router.replace("/loginscreen"); // ไป login
  };

  return {
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
  };
};
