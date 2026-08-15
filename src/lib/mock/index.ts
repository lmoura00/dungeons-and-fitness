import { unstable_localLink } from "@trpc/client";
import { mockRouter } from "./router";
import { usuarioIdFromToken } from "./db";
import { obterToken } from "../auth";

export function criarMockLink() {
  return unstable_localLink({
    router: mockRouter,
    createContext: async () => ({ usuarioId: usuarioIdFromToken(obterToken()) }),
  } as any) as any;
}
