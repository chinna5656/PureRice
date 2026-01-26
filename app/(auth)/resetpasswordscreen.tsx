import React, { useState } from "react";
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Dimensions, 
  Alert 
} from "react-native";
import { Text, TextInput, Button, Card } from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import axios from "axios";

// Components (ใช้ path เดียวกับที่คุณใช้ในหน้า Login)
import Header from "../../src/components/Header";
import Logo from "../../src/components/Logo";

// Utils
import { emailValidator } from "../../src/helpers/emailValidator";
import { theme } from "../../src/core/theme";
import { API_URL } from "../../src/services/api";

const { height } = Dimensions.get('window');

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState({ value: "", error: "" });
  const [loading, setLoading] = useState(false);

  const sendResetPasswordEmail = async () => {
    const emailError = emailValidator(email.value);
    if (emailError) {
      setEmail({ ...email, error: emailError });
      return;
    }

    setLoading(true);

    try {
      // --- ส่วนเชื่อมต่อ API (ตัวอย่าง) ---
      // const response = await axios.post(`${API_URL}/forgot-password`, {
      //   email: email.value,
      // });
      
      // if (response.data.status === "ok") {
      //   Alert.alert("สำเร็จ", "กรุณาตรวจสอบอีเมลของคุณเพื่อตั้งรหัสผ่านใหม่");
      //   router.back(); // หรือ router.replace("/loginscreen");
      // }
      
      // --- Mockup จำลองการส่งสำเร็จ (สำหรับการ Dev) ---
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          "ตรวจสอบอีเมล", 
          "เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปที่ " + email.value + " เรียบร้อยแล้ว",
          [
            { text: "ตกลง", onPress: () => router.back() } // กดตกลงแล้วกลับหน้า Login
          ]
        );
      }, 1500);

    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่พบอีเมลนี้ในระบบ หรือการเชื่อมต่อขัดข้อง");
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
            <Header style={styles.headerText}>กู้คืนรหัสผ่าน</Header>
            <Text style={styles.subTitle}>
              กรอกอีเมลของคุณ เพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่
            </Text>
          </View>

          {/* Reset Form */}
          <Card style={styles.card} elevation={4}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.inputContainer}>
                <TextInput
                  label="อีเมล"
                  returnKeyType="done"
                  value={email.value}
                  onChangeText={(text) => setEmail({ value: text, error: "" })}
                  error={!!email.error}
                  autoCapitalize="none"
                  keyboardType="email-address" // คีย์บอร์ดแบบอีเมล
                  left={<TextInput.Icon icon="email" />}
                  style={styles.textInput}
                  theme={{ colors: { primary: theme.colors.primary } }}
                />
                {email.error ? (
                  <Text style={styles.errorText}>{email.error}</Text>
                ) : null}
              </View>

              <Button
                mode="contained"
                onPress={sendResetPasswordEmail}
                style={styles.button}
                loading={loading}
                disabled={loading}
                labelStyle={styles.buttonText}
              >
                {loading ? "กำลังส่ง..." : "ส่งคำขอเปลี่ยนรหัส"}
              </Button>

              <View style={styles.backContainer}>
                <Text style={styles.backText}>นึกรหัสผ่านออกแล้ว? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.linkText}>เข้าสู่ระบบ</Text>
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
  headerText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  subTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 20,
    marginHorizontal: 10,
    backgroundColor: '#fff',
  },
  cardContent: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.error, // หรือ '#d32f2f'
    paddingTop: 8,
    paddingLeft: 5,
  },
  button: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 25,
    paddingVertical: 6,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  backContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: '#666',
    fontSize: 14,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});