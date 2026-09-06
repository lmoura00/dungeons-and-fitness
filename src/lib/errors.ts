import { TRPCClientError } from "@trpc/client";

// Erros de negócio (ex.: "E-mail ou senha incorretos.") já vêm amigáveis do
// backend via TRPCError (ver backend/src/lib/errors.ts) e têm `error.data`
// preenchido. Quando a requisição nem chega no servidor (sem internet, API
// fora do ar, timeout), `error.data` fica vazio e `error.message` é técnico
// (ex.: "Network request failed") — nesse caso trocamos por uma mensagem útil.
export function mensagemErroAmigavel(error: unknown): string {
  if (error instanceof TRPCClientError && !error.data) {
    return "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Ocorreu um erro inesperado. Tente novamente.";
}
