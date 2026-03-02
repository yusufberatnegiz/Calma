import React from "react";
import { Stack } from "expo-router";
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import { PetProvider } from "../src/state/petStore";
import { SessionProvider } from "../src/state/sessionStore";
import { LogProvider } from "../src/state/logStore";
import { TaskProvider } from "../src/state/taskStore";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  return (
    <PetProvider>
      <SessionProvider>
        <LogProvider>
          <TaskProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
            </Stack>
          </TaskProvider>
        </LogProvider>
      </SessionProvider>
    </PetProvider>
  );
}
