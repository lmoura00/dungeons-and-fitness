import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, criarTrpcClient } from "../lib/trpc";
import { carregarToken } from "../lib/auth";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 30_000 },
        },
      })
  );
  const [trpcClient] = useState(() => criarTrpcClient());
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    // Hidrata o token persistido antes da primeira requisição autenticada.
    carregarToken().finally(() => setPronto(true));
  }, []);

  if (!pronto) return null;

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
