import React, { useEffect } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { TRPCProvider } from "../providers/TRPCProvider";
import { useSession } from "../hooks/useSession";
import { trpc } from "../lib/trpc";
import { obterPushToken } from "../lib/notifications";

function RootNavigator() {
  const { isAuthenticated, isLoadingSession } = useSession();
  const segments = useSegments();
  const router = useRouter();

  const { data: personagem, isLoading: loadingPersonagem, isError: semPersonagem } = trpc.personagens.meuPersonagem.useQuery(
    undefined,
    { enabled: !!isAuthenticated, retry: false }
  );

  const temPersonagem = !semPersonagem && !!personagem;

  useEffect(() => {
    if (isLoadingSession) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "(onboarding)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (!isAuthenticated) {
      // Sem sessão: qualquer rota restaurada (inclusive onboarding) deve voltar pro início.
      if (!inAuthGroup) router.replace("/(auth)/welcome");
      return;
    }

    if (loadingPersonagem) return;

    if (temPersonagem) {
      if (!inTabsGroup) router.replace("/(tabs)/dashboard");
    } else if (!inOnboarding) {
      router.replace("/(onboarding)/choose-race");
    }
  }, [isAuthenticated, isLoadingSession, segments, personagem, loadingPersonagem, semPersonagem, temPersonagem]);

  const atualizarPushTokenMutation = trpc.usuarios.atualizarPushToken.useMutation();

  useEffect(() => {
    if (!isAuthenticated || !temPersonagem) return;
    obterPushToken()
      .then((pushToken) => {
        if (pushToken) atualizarPushTokenMutation.mutate({ pushToken });
      })
      .catch((erro) => console.warn("Falha ao obter push token:", erro));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, temPersonagem]);

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
    <SafeAreaProvider>
      <TRPCProvider>
        <StatusBar style="light" backgroundColor={Colors.background} />
        <RootNavigator />
      </TRPCProvider>
    </SafeAreaProvider>
  );
}
