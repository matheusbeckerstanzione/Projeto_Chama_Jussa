import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { OSProvider } from '@/contexts/os-context';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { AppColors } from '@/constants/theme';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const styleId = 'chamajussa-no-outline-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      * {
        -webkit-tap-highlight-color: transparent !important;
        outline: none !important;
      }
      *:focus, *:focus-visible {
        outline: none !important;
        box-shadow: none !important;
      }
      [tabindex], button, a, div {
        outline: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: AppColors.background,
    card: AppColors.background,
    text: AppColors.white,
    border: AppColors.border,
    primary: AppColors.primary,
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthGate() {
  const { isLoggedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isLoggedIn && inTabsGroup) {
      router.replace('/login');
    } else if (isLoggedIn && segments[0] === 'login') {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <OSProvider>
        <ThemeProvider value={customDarkTheme}>
          <AuthGate />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: AppColors.background },
            }}
          >
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="detalhes-os"
              options={{
                headerShown: false,
                presentation: 'card',
                animation: 'slide_from_right',
              }}
            />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </OSProvider>
    </AuthProvider>
  );
}
