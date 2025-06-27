import React, { useState, useEffect } from "react";
import {
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Button, TextInput } from 'react-native-paper';

// 👇 ใช้ component สวย ๆ ที่คุณมีอยู่แล้ว
import Logo from "../components/Logo";
import Header from "../components/Header";
//import Button from "../components/Button";
//import TextInput from "../components/TextInput";
import { theme } from "../core/theme";
import { emailValidator } from "../helpers/emailValidator";
import { passwordValidator } from "../helpers/passwordValidator";
import { API_URL } from "../services/api";
import Background from "@/components/Background";
import { useAuth } from "../contexts/AuthContext";


export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // ✅ Auto-login
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
      if (token && isLoggedIn === "true") {
        router.replace("/mainscreen"); // แก้เส้นทางตาม expo-router
      }
    };
    checkToken();
  }, []);

  const onLoginPressed = async () => {
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);

    if (emailError || passwordError) {
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/login-user`, {
        email: email.value,
        password: password.value,
      });

      if (res.data.status === "ok") {
        //await AsyncStorage.setItem("token", res.data.data);
        //await AsyncStorage.setItem("isLoggedIn", "true");
        await login({ username: email.value, token: res.data.data });

        Alert.alert("เข้าสู่ระบบสำเร็จ", res.data.message);
        router.replace("/mainscreen"); // เปลี่ยนไปหน้า home
      } else {
        Alert.alert("ไม่สามารถเข้าสู่ระบบ", res.data.message || "Unknown error");
      }
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
    <ImageBackground
      source={require("../assets/bg-gradient.png")} // ใส่ภาพ background สำหรับ Expo
      style={styles.background}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Logo />
        <Header>เข้าสู่ระบบ</Header>

        <TextInput
          label="Email"
          returnKeyType="next"
          value={email.value}
          onChangeText={(text) => setEmail({ value: text, error: "" })}
          error={!!email.error}
    
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          label="Password"
          returnKeyType="done"
          value={password.value}
          onChangeText={(text) => setPassword({ value: text, error: "" })}
          error={!!password.error}
        
          secureTextEntry
        />

        

        <Button mode="contained" onPress={onLoginPressed} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : "เข้าสู่ระบบ"}
        </Button>

        <View style={styles.row}>
          <Text>ยังไม่มีบัญชี?</Text>
          <TouchableOpacity onPress={() => router.replace("/registerscreen")}>
            <Text style={styles.link}> สมัครเลย</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
    </Background>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.secondary,
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  link: {
    fontWeight: "bold",
    color: theme.colors.primary,
    marginLeft: 4,
  },
});
