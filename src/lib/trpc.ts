import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, httpSubscriptionLink, splitLink } from "@trpc/client";
import RNEventSource from "react-native-sse";
import Constants from "expo-constants";
import { Platform } from "react-native";
import type { AppRouter } from "../../../back/src/trpc/router";
import { obterToken } from "./auth";

export const trpc = createTRPCReact<AppRouter>();

export function obterBaseUrl(): string {
  // Override explícito (ex.: API em produção ou túnel)
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  // Em dev, o Metro expõe o IP da máquina em hostUri — funciona em
  // dispositivo físico na mesma rede e em emuladores.
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  if (host) return `http://${host}:3333`;

  // Fallback: emulador Android não enxerga localhost da máquina.
  const localhost = Platform.OS === "android" ? "10.0.2.2" : "localhost";
  return `http://${localhost}:3333`;
}

export function criarTrpcClient() {
  return trpc.createClient({
    links: [
      splitLink({
        condition: (op) => op.type === "subscription",
        true: httpSubscriptionLink({
          url: `${obterBaseUrl()}/trpc`,
          EventSource: RNEventSource as unknown as typeof EventSource,
          eventSourceOptions() {
            const token = obterToken();
            return { headers: token ? { Authorization: `Bearer ${token}` } : {} } as EventSourceInit;
          },
        }),
        false: httpBatchLink({
          url: `${obterBaseUrl()}/trpc`,
          headers() {
            const token = obterToken();
            return token ? { Authorization: `Bearer ${token}` } : {};
          },
        }),
      }),
    ],
  });
}
