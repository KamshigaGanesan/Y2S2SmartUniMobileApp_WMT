//This version sends both admin and normal users into the real app first, and admin can still open /admin from a button.
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        </>
      ) : (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      )}

      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen
        name="lecturer-publications"
        options={{ title: 'Lecturer Publications', headerShown: true }}
      />
      <Stack.Screen
        name="lostfound"
        options={{ title: 'Lost & Found', headerShown: true }}
      />
      <Stack.Screen
        name="campus-directory"
        options={{ title: 'Campus Directory', headerShown: true }}
      />
      <Stack.Screen
        name="book-details"
        options={{ title: 'Book Details', headerShown: true }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}