import { Barlow_400Regular } from '@expo-google-fonts/barlow/400Regular';
import { Barlow_600SemiBold } from '@expo-google-fonts/barlow/600SemiBold';
import { BarlowCondensed_600SemiBold } from '@expo-google-fonts/barlow-condensed/600SemiBold';
import { BarlowCondensed_800ExtraBold } from '@expo-google-fonts/barlow-condensed/800ExtraBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { colors, fonts } from '../src/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Si una fuente no carga, se sigue con la del sistema.
  const [loaded, error] = useFonts({
    Barlow_400Regular,
    Barlow_600SemiBold,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_800ExtraBold,
  });
  const ready = loaded || !!error;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: fonts.subtitle },
          contentStyle: { backgroundColor: colors.bg },
          headerBackTitle: 'Atrás',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="content/[id]" options={{ title: '', headerTransparent: true }} />
        <Stack.Screen name="player/[id]" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      </Stack>
    </>
  );
}
