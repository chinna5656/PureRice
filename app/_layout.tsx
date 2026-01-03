// app/_layout.tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

// สร้าง Component ย่อยเพื่อเช็คสถานะและ Redirect
const RootLayoutNav = () => {
  const { userToken, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)'; // ถ้าคุณมีการจัดกลุ่ม (ในภาพยังไม่มี ไม่เป็นไร)

    // ถ้าไม่มี Token และไม่ได้อยู่ในหน้า Login/Register/Start -> ดีดกลับไปหน้า Start
    // หมายเหตุ: ปรับ logic ตรงนี้ตาม Flow ที่คุณต้องการ
    if (!userToken) {
        // เช็คว่าตอนนี้อยู่หน้าไหน ถ้าไม่ใช่หน้าพวกนี้ ให้เด้งไป startscreen
        const currentRoute = segments[0]; 
        if (currentRoute !== 'loginscreen' && currentRoute !== 'registerscreen' && currentRoute !== 'startscreen') {
             router.replace('/startscreen'); 
        }
    } else {
      // ถ้ามี Token แล้ว ให้เด้งไปหน้า Main
       router.replace('/mainscreen');
    }
  }, [userToken, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="startscreen" options={{ headerShown: false }} />
      <Stack.Screen name="loginscreen" options={{ headerShown: false }} />
      <Stack.Screen name="registerscreen" options={{ headerShown: false }} />
      <Stack.Screen name="mainscreen" options={{ headerShown: false }} /> 
      {/* เพิ่มหน้าอื่นๆ ตามต้องการ */}
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}