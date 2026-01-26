import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

// Icons
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// Utils (สมมติว่ามีการเรียกใช้ Auth หรือ Storage)
import { saveLoggedIn, saveToken } from "../../src/services/storage/secureStore";

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();

  // Mock User Data (ข้อมูลจำลอง)
  const user = {
    name: "Admin User",
    email: "admin@example.com",
    avatar: "https://i.pravatar.cc/300?img=12", // รูปตัวอย่าง
    memberSince: "ม.ค. 2024",
    scans: 128,
    pro: true
  };

  const handleLogout = () => {
    Alert.alert(
      "ออกจากระบบ",
      "คุณแน่ใจหรือไม่ที่จะออกจากระบบ?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ยืนยัน",
          style: "destructive",
          onPress: async () => {
            try {
              // เคลียร์ Token (ถ้ามี Logic จริงให้ uncomment)
              // await saveToken(null);
              // await saveLoggedIn("false");
              
              // กลับไปหน้า Login
              router.replace("/"); 
            } catch (e) {
              console.error(e);
            }
          }
        }
      ]
    );
  };

  // Component สำหรับเมนูแต่ละบรรทัด
  const MenuItem = ({ icon, title, subtitle, onPress, isDestructive = false, showChevron = true }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconBox, isDestructive && styles.menuIconBoxDestructive]}>
        <Ionicons name={icon} size={22} color={isDestructive ? "#FF6B6B" : "#fff"} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, isDestructive && styles.textDestructive]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background */}
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>โปรไฟล์ของฉัน</Text>
          <View style={{ width: 40 }} /> 
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* User Card */}
          <View style={styles.userCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.userCardGradient}
            >
              <View style={styles.avatarContainer}>
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                {user.pro && (
                  <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.proBadge}>
                    <Text style={styles.proText}>PRO</Text>
                  </LinearGradient>
                )}
              </View>
              
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>

              {/* Stats Row */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{user.scans}</Text>
                  <Text style={styles.statLabel}>สแกนทั้งหมด</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{user.memberSince}</Text>
                  <Text style={styles.statLabel}>สมาชิกตั้งแต่</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Menu Section 1: General */}
          <Text style={styles.sectionHeader}>บัญชีผู้ใช้</Text>
          <View style={styles.menuContainer}>
            <MenuItem 
              icon="person-outline" 
              title="แก้ไขข้อมูลส่วนตัว" 
              subtitle="ชื่อ, รูปโปรไฟล์"
              onPress={() => {}} 
            />
            <View style={styles.menuDivider} />
            <MenuItem 
              icon="time-outline" 
              title="ประวัติการวิเคราะห์" 
              onPress={() => router.push("/historyscreen")} 
            />
          </View>

          {/* Menu Section 2: Settings */}
          <Text style={styles.sectionHeader}>การตั้งค่า</Text>
          <View style={styles.menuContainer}>
            <MenuItem 
              icon="notifications-outline" 
              title="การแจ้งเตือน" 
              onPress={() => {}} 
            />
            <View style={styles.menuDivider} />
            <MenuItem 
              icon="shield-checkmark-outline" 
              title="ความปลอดภัย" 
              onPress={() => {}} 
            />
            <View style={styles.menuDivider} />
            <MenuItem 
              icon="help-circle-outline" 
              title="ช่วยเหลือ & สนับสนุน" 
              onPress={() => {}} 
            />
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LinearGradient colors={['#FF6B6B', '#FF5252']} style={styles.logoutGradient}>
              <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>ออกจากระบบ</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.versionText}>Version 1.0.0 (Beta)</Text>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // User Card Styles
  userCard: {
    marginBottom: 30,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  userCardGradient: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  proBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#302b63',
  },
  proText: {
    color: '#302b63',
    fontWeight: '900',
    fontSize: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },

  // Menu Styles
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 10,
    marginLeft: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuIconBoxDestructive: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  textDestructive: {
    color: '#FF6B6B',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginLeft: 68, // indent to align with text
  },

  // Logout Button
  logoutButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 20,
  },
  logoutGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    marginBottom: 20,
  },
});