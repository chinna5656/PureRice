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
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Button, TextInput, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

// Components
import Logo from "../components/Logo";
import Header from "../components/Header";
import Background from "@/components/Background";
import { useAuth } from "../contexts/AuthContext";

// Utils
import { theme } from "../core/theme";
import { emailValidator } from "../helpers/emailValidator";
import { passwordValidator } from "../helpers/passwordValidator";
import { API_URL } from "../services/api";

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auto-login check
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
        if (token && isLoggedIn === "true") {
          router.replace("/mainscreen");
        }
      } catch (error) {
        console.error("Token check error:", error);
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
        await login({ username: email.value, token: res.data.data });
        Alert.alert("เข้าสู่ระบบสำเร็จ", res.data.message);
        router.replace("/mainscreen");
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
    
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Logo />
              <Header style={styles.welcomeText}>ยินดีต้อนรับ</Header>
              <Text style={styles.subTitle}>เข้าสู่ระบบเพื่อดำเนินการต่อ</Text>
            </View>

            {/* Login Form */}
            <Card style={styles.loginCard} elevation={8}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.inputContainer}>
                  <TextInput
                    label="อีเมล"
                    mode="outlined"
                    value={email.value}
                    onChangeText={(text) => setEmail({ value: text, error: "" })}
                    error={!!email.error}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="next"
                    left={<TextInput.Icon icon="email" />}
                    style={styles.textInput}
                    theme={{ colors: { primary: theme.colors.primary } }}
                  />
                  {email.error ? (
                    <Text style={styles.errorText}>{email.error}</Text>
                  ) : null}
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    label="รหัสผ่าน"
                    mode="outlined"
                    value={password.value}
                    onChangeText={(text) => setPassword({ value: text, error: "" })}
                    error={!!password.error}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={onLoginPressed}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? "eye" : "eye-off"}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    style={styles.textInput}
                    theme={{ colors: { primary: theme.colors.primary } }}
                  />
                  {password.error ? (
                    <Text style={styles.errorText}>{password.error}</Text>
                  ) : null}
                </View>

                {/* Forgot Password */}
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotText}>ลืมรหัสผ่าน?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <Button
                  mode="contained"
                  onPress={onLoginPressed}
                  disabled={loading}
                  style={styles.loginButton}
                  contentStyle={styles.loginButtonContent}
                  labelStyle={styles.loginButtonText}
                  loading={loading}
                >
                  {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </Button>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>หรือ</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Login Buttons 
                <View style={styles.socialButtons}>
                  <TouchableOpacity style={styles.socialButton}>
                    <MaterialIcons name="google" size={24} color="#db4437" />
                    <Text style={styles.socialButtonText}>Google</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.socialButton}>
                    <MaterialIcons name="facebook" size={24} color="#3b5998" />
                    <Text style={styles.socialButtonText}>Facebook</Text>
                  </TouchableOpacity>
                </View>*/}

                {/* Register Link */}
                <View style={styles.registerSection}>
                  <Text style={styles.registerText}>ยังไม่มีบัญชี? </Text>
                  <TouchableOpacity onPress={() => router.replace("/registerscreen")}>
                    <Text style={styles.registerLink}>สมัครเลย</Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: height,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  subTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
  loginCard: {
    borderRadius: 20,
    marginHorizontal: 10,
    backgroundColor: '#fff',
  },
  cardContent: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: 20,
    borderRadius: 25,
    elevation: 3,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});