import React, { useEffect } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../constants/Colors";
import { TRPCProvider } from "../providers/TRPCProvider";
import { useSession } from "../hooks/useSession";
import { trpc } from "../lib/trpc";

function RootNavigator() {
  const { isAuthenticated } = useSession();
  const segments = useSegments();
  const router = useRouter();

  const { data: personagem, isLoading: loadingPersonagem, isError: semPersonagem } = trpc.personagens.meuPersonagem.useQuery(
    undefined,
    { enabled: isAuthenticated, retry: false }
  );

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "(onboarding)";

    if (!isAuthenticated && !inAuthGroup && !inOnboarding) {
      router.replace("/(auth)");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/dashboard");
    } else if (isAuthenticated && !inAuthGroup && !inOnboarding && !loadingPersonagem && (semPersonagem || !personagem)) {
      router.replace("/(onboarding)/choose-race");
    }
  }, [isAuthenticated, segments, personagem, loadingPersonagem, semPersonagem]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <TRPCProvider>
      <StatusBar style="light" backgroundColor={Colors.background} />
      <RootNavigator />
    </TRPCProvider>
  );
}
