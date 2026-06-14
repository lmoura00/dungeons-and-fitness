import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@dungeons/token";
const USER_ID_KEY = "@dungeons/usuarioId";

let _novaContaPendente = false;

export function marcarNovaContaPendente(): void {
  _novaContaPendente = true;
}

export function limparNovaContaPendente(): void {
  _novaContaPendente = false;
}

export function isNovaContaPendente(): boolean {
  return _novaContaPendente;
}

let tokenEmMemoria: string | null = null;
const listeners: Array<(autenticado: boolean) => void> = [];

export function inscreverAuth(fn: (autenticado: boolean) => void): () => void {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i > -1) listeners.splice(i, 1);
  };
}

function notificar(autenticado: boolean) {
  listeners.forEach((fn) => fn(autenticado));
}

export async function carregarToken(): Promise<string | null> {
  if (tokenEmMemoria) return tokenEmMemoria;
  tokenEmMemoria = await AsyncStorage.getItem(TOKEN_KEY);
  return tokenEmMemoria;
}

export function obterToken(): string | null {
  return tokenEmMemoria;
}

export async function salvarSessao(token: string, usuarioId: string): Promise<void> {
  tokenEmMemoria = token;
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_ID_KEY, usuarioId],
  ]);
  notificar(true);
}

export async function limparSessao(): Promise<void> {
  tokenEmMemoria = null;
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_ID_KEY]);
  notificar(false);
}

export async function obterUsuarioId(): Promise<string | null> {
  return AsyncStorage.getItem(USER_ID_KEY);
}
