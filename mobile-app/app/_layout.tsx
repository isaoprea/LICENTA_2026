// mobile-app/app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ 
        headerShown: false, // Ascundem bara de sus pentru un aspect curat
        contentStyle: { backgroundColor: '#020617' } 
      }}>
        {/* Ecranul de index va fi Login-ul */}
        <Stack.Screen name="index" options={{ title: 'Login' }} />
        <Stack.Screen name="(tabs)" options={{ title: 'Main' }} />
      </Stack>
    </>
  );
}