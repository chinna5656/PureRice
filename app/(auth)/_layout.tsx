import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="startscreen" />
      <Stack.Screen name="loginscreen" />
      <Stack.Screen name="registerscreen" />
    </Stack>
  );
}