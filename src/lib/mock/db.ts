// Backend "de mentirinha" usado no build de demonstração offline
// (EXPO_PUBLIC_MOCK=true). Substitui o servidor real por dados em memória —
// tudo é perdido ao reiniciar o app. Espelha as regras de backend/src/modules/*
// na medida do necessário para as telas existentes.
import { TRPCError } from "@trpc/server";

export const Erros = {
  naoEncontrado: (e: string) => new TRPCError({ code: "NOT_FOUND", message: `${e} não encontrado(a).` }),
  conflito: (m: string) => new TRPCError({ code: "CONFLICT", message: m }),
  semPermissao: (m: string) => new TRPCError({ code: "FORBIDDEN", message: m }),
  requisicaoInvalida: (m: string) => new TRPCError({ code: "BAD_REQUEST", message: m }),
  credenciaisInvalidas: () => new TRPCError({ code: "UNAUTHORIZED", message: "E-mail ou senha incorretos." }),
  naoAutenticado: () => new TRPCError({ code: "UNAUTHORIZED", message: "Não autenticado." }),
};

// ─── Fórmula de XP (espelha backend/src/lib/xp-formula.ts) ────────────────
export const XP_POR_NIVEL = 3000;
type Patamar = "Iniciante" | "Aventureiro" | "Herói" | "Lendário";

export function calcularNivel(xp: number) {
  return Math.floor(xp / XP_POR_NIVEL) + 1;
}
function calcularPatamar(nivel: number): Patamar {
  if (nivel <= 10) return "Iniciante";
  if (nivel <= 20) return "Aventureiro";
  if (nivel <= 30) return "Herói";
  return "Lendário";
}
function aplicarBonus(xp: number, pct: number) {
  return Math.round(xp * (1 + pct));
}

export interface ResultadoXP {
  xpAntes: number; xpDepois: number; xpGanho: number;
  nivelAntes: number; nivelDepois: number; subioDeNivel: boolean;
  patamarAnterior: Patamar; patamarAtual: Patamar; mudouPatamar: boolean; progresso: number;
}

export function calcularResultadoXP(xpAtual: number, xpBase: number, bonusPct = 0): ResultadoXP {
  const xpGanho = aplicarBonus(xpBase, bonusPct);
  const xpDepois = xpAtual + xpGanho;
  const nivelAntes = calcularNivel(xpAtual);
  const nivelDepois = calcularNivel(xpDepois);
  const patamarAnterior = calcularPatamar(nivelAntes);
  const patamarAtual = calcularPatamar(nivelDepois);
  return {
    xpAntes: xpAtual, xpDepois, xpGanho, nivelAntes, nivelDepois,
    subioDeNivel: nivelDepois > nivelAntes,
    patamarAnterior, patamarAtual, mudouPatamar: patamarAtual !== patamarAnterior,
    progresso: ((xpDepois % XP_POR_NIVEL) / XP_POR_NIVEL) * 100,
  };
}

const TABELA_CALORIAS: Record<string, Record<string, number>> = {
  corrida: { leve: 6, moderado: 9, intenso: 13 },
  forca: { leve: 4, moderado: 6, intenso: 9 },
  ciclismo: { leve: 5, moderado: 8, intenso: 11 },
  natacao: { leve: 5, moderado: 7, intenso: 10 },
  yoga: { leve: 3, moderado: 4, intenso: 5 },
  esporte: { leve: 5, moderado: 7, intenso: 10 },
  outro: { leve: 4, moderado: 6, intenso: 8 },
};
export function estimarCalorias(tipo: string, minutos: number, intensidade: string) {
  return Math.round((TABELA_CALORIAS[tipo]?.[intensidade] ?? 5) * minutos);
}

function hojeISO() {
  return new Date().toISOString().split("T")[0];
}

let seq = 0;
function uid(prefix: string) {
  seq += 1;
  return `${prefix}-${seq}-${Date.now().toString(36)}`;
}

// ─── Catálogo estático ──────────────────────────────────────────────────────

export const races = [
  { id: "race-humano", name: "Humano", lore: null, artUrl: null, baseStrength: 11, baseAgility: 11, baseFocus: 11, baseEnergy: 11 },
  { id: "race-anao", name: "Anão", lore: null, artUrl: null, baseStrength: 14, baseAgility: 8, baseFocus: 9, baseEnergy: 13 },
  { id: "race-elfo", name: "Elfo", lore: null, artUrl: null, baseStrength: 8, baseAgility: 14, baseFocus: 13, baseEnergy: 9 },
];

export const classes = [
  { id: "class-aprendiz", name: "Aprendiz", lore: null, artUrl: null, unlockLevel: 0, xpBonusType: null as string | null, xpBonusPct: 0 },
  { id: "class-guerreiro", name: "Guerreiro", lore: null, artUrl: null, unlockLevel: 5, xpBonusType: "forca", xpBonusPct: 0.1 },
  { id: "class-mago", name: "Mago", lore: null, artUrl: null, unlockLevel: 5, xpBonusType: "mental", xpBonusPct: 0.1 },
  { id: "class-monge", name: "Monge", lore: null, artUrl: null, unlockLevel: 5, xpBonusType: "equilibrado", xpBonusPct: 0.1 },
  { id: "class-patrulheiro", name: "Patrulheiro", lore: null, artUrl: null, unlockLevel: 5, xpBonusType: "cardio", xpBonusPct: 0.1 },
];

export const missionsCatalog = [
  { id: "m1", title: "Corrida Matinal", description: "Corra 20 minutos para começar o dia com energia.", category: "cardio", difficulty: "facil", frequency: "diaria", xpReward: 150, isActive: true },
  { id: "m2", title: "Treino de Força", description: "Complete uma sessão de musculação de 30 minutos.", category: "forca", difficulty: "moderado", frequency: "diaria", xpReward: 220, isActive: true },
  { id: "m3", title: "Momento Zen", description: "Pratique 15 minutos de meditação ou yoga.", category: "mental", difficulty: "facil", frequency: "diaria", xpReward: 120, isActive: true },
  { id: "m4", title: "Desafio Full Body", description: "Circuito completo de 40 minutos, sem pausas longas.", category: "full_body", difficulty: "dificil", frequency: "diaria", xpReward: 300, isActive: true },
  { id: "m5", title: "Alongamento Consciente", description: "20 minutos de flexibilidade e mobilidade.", category: "flexibilidade", difficulty: "facil", frequency: "diaria", xpReward: 110, isActive: true },
  { id: "m6", title: "Pedal Livre", description: "Ciclismo de 30 minutos em ritmo moderado.", category: "cardio", difficulty: "moderado", frequency: "diaria", xpReward: 200, isActive: true },
  { id: "m7", title: "Superação", description: "Treino intenso de 45 minutos — só para os fortes.", category: "forca", difficulty: "dificil", frequency: "diaria", xpReward: 320, isActive: true },
  { id: "m8", title: "Respire Fundo", description: "10 minutos de respiração e foco mental.", category: "mental", difficulty: "facil", frequency: "diaria", xpReward: 90, isActive: true },
];

export const achievementsCatalog = [
  { id: "a1", title: "Primeiros Passos", description: "Complete sua primeira missão.", icon: "🥾", conditionType: "missoes_concluidas", conditionValue: 1, xpReward: 50 },
  { id: "a2", title: "Disciplina de Ferro", description: "Mantenha um streak de 3 dias.", icon: "🔥", conditionType: "streak_dias", conditionValue: 3, xpReward: 100 },
  { id: "a3", title: "Uma Semana de Fogo", description: "Mantenha um streak de 7 dias.", icon: "🔥", conditionType: "streak_dias", conditionValue: 7, xpReward: 200 },
  { id: "a4", title: "Aventureiro", description: "Alcance o nível 5.", icon: "⭐", conditionType: "nivel_alcancado", conditionValue: 5, xpReward: 150 },
  { id: "a5", title: "Veterano", description: "Alcance o nível 10.", icon: "🏆", conditionType: "nivel_alcancado", conditionValue: 10, xpReward: 300 },
  { id: "a6", title: "Maratonista de Missões", description: "Complete 10 missões.", icon: "📜", conditionType: "missoes_concluidas", conditionValue: 10, xpReward: 250 },
];

const MAX_MEMBROS_GUILDA = 10;

// ─── Estado mutável ─────────────────────────────────────────────────────────

export interface MockUser {
  id: string; email: string; username: string; fullName: string; role: "usuario" | "admin";
  birthDate: string | null; gender: string | null; fitnessGoal: string | null; activityLevel: string | null;
  weightKg: number | null; heightCm: number | null; streakDays: number; lastActiveAt: Date | null;
  pushToken: string | null; createdAt: Date;
}
export interface MockCharacter {
  id: string; userId: string; raceId: string; classId: string; name: string;
  level: number; currentXp: number; nextLevelXp: number;
  attributes: { strength: number; agility: number; focus: number; energy: number };
}
interface MockUserMission { id: string; characterId: string; missionId: string; status: "pendente" | "concluida" | "expirada"; assignedDate: string; completedAt: Date | null }
interface MockUserAchievement { id: string; characterId: string; achievementId: string; unlockedAt: Date }
interface MockGuild { id: string; name: string; description: string | null; emblem: string; leaderId: string; totalXp: number }
interface MockGuildMember { id: string; guildId: string; characterId: string; role: "lider" | "membro" }
interface MockGuildInvite { id: string; guildId: string; characterId: string; convidadoPorId: string; status: "pendente" | "aceito" | "recusado"; createdAt: Date }
interface MockActivityLog { id: string; characterId: string; activityType: string; durationMinutes: number; distanceKm: number | null; intensity: string; xpEarned: number; loggedAt: Date }
interface MockHealthMetric { id: string; characterId: string; date: string; steps: number; distanceKm: number | null; avgHeartRateBpm: number | null; source: "healthkit" | "health_connect"; syncedAt: Date }

const state = {
  users: new Map<string, MockUser>(),
  characters: new Map<string, MockCharacter>(),
  charactersByUserId: new Map<string, string>(),
  userMissions: [] as MockUserMission[],
  userAchievements: [] as MockUserAchievement[],
  guilds: new Map<string, MockGuild>(),
  guildMembers: [] as MockGuildMember[],
  guildInvites: [] as MockGuildInvite[],
  activityLogs: [] as MockActivityLog[],
  healthMetrics: [] as MockHealthMetric[],
};

function criarPersonagem(opts: {
  userId: string; raceId: string; classId: string; name: string; level: number; currentXp: number;
  attrs: { strength: number; agility: number; focus: number; energy: number };
}): MockCharacter {
  const personagem: MockCharacter = {
    id: uid("char"), userId: opts.userId, raceId: opts.raceId, classId: opts.classId,
    name: opts.name, level: opts.level, currentXp: opts.currentXp, nextLevelXp: 3000,
    attributes: opts.attrs,
  };
  state.characters.set(personagem.id, personagem);
  state.charactersByUserId.set(opts.userId, personagem.id);
  return personagem;
}

function seed() {
  const demoUser: MockUser = {
    id: "user-demo", email: "demo@dungeons.app", username: "demo_hero", fullName: "Aventureiro Demo",
    role: "usuario", birthDate: null, gender: "masculino", fitnessGoal: "ganho_de_massa", activityLevel: "intermediario",
    weightKg: 78, heightCm: 178, streakDays: 5, lastActiveAt: new Date(), pushToken: null, createdAt: new Date(),
  };
  state.users.set(demoUser.id, demoUser);

  const demoChar = criarPersonagem({
    userId: demoUser.id, raceId: "race-humano", classId: "class-guerreiro",
    name: "Kael Bravos", level: 7, currentXp: 19500,
    attrs: { strength: 17, agility: 13, focus: 12, energy: 16 },
  });

  const hoje = hojeISO();
  const escolhidas = [missionsCatalog[0], missionsCatalog[1], missionsCatalog[3]];
  escolhidas.forEach((m, i) => {
    state.userMissions.push({
      id: uid("um"), characterId: demoChar.id, missionId: m.id,
      status: i === 0 ? "concluida" : "pendente",
      assignedDate: hoje, completedAt: i === 0 ? new Date() : null,
    });
  });

  ["a1", "a2", "a4"].forEach((achievementId) => {
    state.userAchievements.push({ id: uid("ua"), characterId: demoChar.id, achievementId, unlockedAt: new Date() });
  });

  const npcs = [
    { userId: "npc-thorin", name: "Thorin Punho-Firme", raceId: "race-anao", classId: "class-guerreiro", level: 9 },
    { userId: "npc-lyra", name: "Lyra Sussurro-Élfico", raceId: "race-elfo", classId: "class-mago", level: 12 },
    { userId: "npc-brom", name: "Brom Pedra-Firme", raceId: "race-anao", classId: "class-monge", level: 6 },
    { userId: "npc-sable", name: "Sable Vento-Rápido", raceId: "race-elfo", classId: "class-patrulheiro", level: 8 },
    { userId: "npc-mira", name: "Mira Coração-Bravo", raceId: "race-humano", classId: "class-guerreiro", level: 5 },
    { userId: "npc-finn", name: "Finn Passo-Leve", raceId: "race-humano", classId: "class-aprendiz", level: 2 },
  ];
  const npcChars = npcs.map((n) =>
    criarPersonagem({
      userId: n.userId, raceId: n.raceId, classId: n.classId, name: n.name, level: n.level,
      currentXp: (n.level - 1) * XP_POR_NIVEL + 500,
      attrs: { strength: 10, agility: 10, focus: 10, energy: 10 },
    })
  );

  const guildaFerro: MockGuild = { id: "guild-ferro", name: "Punho de Ferro", description: "Força bruta e disciplina acima de tudo.", emblem: "espada", leaderId: npcChars[0].id, totalXp: 42000 };
  state.guilds.set(guildaFerro.id, guildaFerro);
  state.guildMembers.push({ id: uid("gm"), guildId: guildaFerro.id, characterId: npcChars[0].id, role: "lider" });
  state.guildMembers.push({ id: uid("gm"), guildId: guildaFerro.id, characterId: npcChars[2].id, role: "membro" });

  const guildaFenix: MockGuild = { id: "guild-fenix", name: "Ordem da Fênix", description: "Renascer a cada treino.", emblem: "dragao", leaderId: npcChars[1].id, totalXp: 68500 };
  state.guilds.set(guildaFenix.id, guildaFenix);
  state.guildMembers.push({ id: uid("gm"), guildId: guildaFenix.id, characterId: npcChars[1].id, role: "lider" });
  state.guildMembers.push({ id: uid("gm"), guildId: guildaFenix.id, characterId: npcChars[3].id, role: "membro" });
  state.guildMembers.push({ id: uid("gm"), guildId: guildaFenix.id, characterId: npcChars[4].id, role: "membro" });

  state.guildInvites.push({
    id: uid("gi"), guildId: guildaFerro.id, characterId: demoChar.id, convidadoPorId: npcChars[0].id,
    status: "pendente", createdAt: new Date(),
  });
}
seed();

// ─── Helpers de personagem ──────────────────────────────────────────────────

function getCharacterByUserId(userId: string): MockCharacter | undefined {
  const cid = state.charactersByUserId.get(userId);
  return cid ? state.characters.get(cid) : undefined;
}

function requireCharacter(userId: string): MockCharacter {
  const c = getCharacterByUserId(userId);
  if (!c) throw Erros.naoEncontrado("Personagem");
  return c;
}

function joinRaceClass(c: MockCharacter) {
  const race = races.find((r) => r.id === c.raceId) ?? null;
  const clazz = classes.find((cl) => cl.id === c.classId) ?? null;
  return { ...c, race, class: clazz };
}

// ─── auth ───────────────────────────────────────────────────────────────────

export function registrar(input: { email: string; senha: string; nomeUsuario: string; nomeCompleto: string; dataNascimento?: string; genero?: string; objetivoFitness?: string; nivelAtividade?: string; pesoKg: number; alturaCm: number }) {
  const emailNorm = input.email.trim().toLowerCase();
  for (const u of state.users.values()) {
    if (u.email.toLowerCase() === emailNorm) throw Erros.conflito("Este e-mail já está em uso.");
  }
  const user: MockUser = {
    id: uid("user"), email: input.email.trim(), username: input.nomeUsuario, fullName: input.nomeCompleto,
    role: "usuario", birthDate: input.dataNascimento ?? null, gender: input.genero ?? null,
    fitnessGoal: input.objetivoFitness ?? null, activityLevel: input.nivelAtividade ?? null,
    weightKg: input.pesoKg, heightCm: input.alturaCm, streakDays: 0, lastActiveAt: null,
    pushToken: null, createdAt: new Date(),
  };
  state.users.set(user.id, user);
  return { usuarioId: user.id, email: user.email };
}

export function login(input: { email: string; senha: string }) {
  const emailNorm = input.email.trim().toLowerCase();
  const user = [...state.users.values()].find((u) => u.email.toLowerCase() === emailNorm);
  if (!user) throw Erros.credenciaisInvalidas();
  return { token: `mock.${user.id}`, usuarioId: user.id };
}

export function usuarioIdFromToken(token: string | null): string | null {
  if (!token || !token.startsWith("mock.")) return null;
  const id = token.slice("mock.".length);
  return state.users.has(id) ? id : null;
}

const resetCodes = new Map<string, string>();
export function solicitarResetSenha(input: { email: string }) {
  const emailNorm = input.email.trim().toLowerCase();
  const existe = [...state.users.values()].some((u) => u.email.toLowerCase() === emailNorm);
  if (existe) resetCodes.set(emailNorm, "123456");
  return { mensagem: "Se o e-mail existir, um código foi enviado." };
}
export function redefinirSenha(input: { email: string; codigo: string; novaSenha: string }) {
  const emailNorm = input.email.trim().toLowerCase();
  if (resetCodes.get(emailNorm) !== input.codigo) throw Erros.requisicaoInvalida("Código inválido ou expirado.");
  resetCodes.delete(emailNorm);
  return { mensagem: "Senha redefinida com sucesso." };
}

// ─── usuarios ───────────────────────────────────────────────────────────────

export function meuPerfil(userId: string) {
  const u = state.users.get(userId);
  if (!u) throw Erros.naoEncontrado("Usuário");
  return u;
}
export function atualizarPushToken(userId: string, pushToken: string | null) {
  const u = state.users.get(userId);
  if (u) u.pushToken = pushToken;
  return { sucesso: true };
}

// ─── personagens ────────────────────────────────────────────────────────────

export function meuPersonagem(userId: string) {
  return joinRaceClass(requireCharacter(userId));
}

export function criarPersonagemUsuario(userId: string, input: { nome: string; racaId: string; classeId: string }) {
  if (getCharacterByUserId(userId)) throw Erros.conflito("Você já possui um personagem.");
  const raca = races.find((r) => r.id === input.racaId);
  if (!raca) throw Erros.naoEncontrado("Raça");
  const classe = classes.find((c) => c.id === input.classeId);
  if (!classe) throw Erros.naoEncontrado("Classe");
  if (classe.unlockLevel > 0) throw Erros.semPermissao("Classe ainda não desbloqueada.");
  return criarPersonagem({
    userId, raceId: input.racaId, classId: input.classeId, name: input.nome, level: 1, currentXp: 0,
    attrs: { strength: raca.baseStrength, agility: raca.baseAgility, focus: raca.baseFocus, energy: raca.baseEnergy },
  });
}

export function trocarClasseUsuario(userId: string, classeId: string) {
  const personagem = requireCharacter(userId);
  const nivel = calcularNivel(personagem.currentXp);
  if (nivel < 5) throw Erros.semPermissao("A escolha de classe é desbloqueada no nível 5.");
  const classe = classes.find((c) => c.id === classeId);
  if (!classe) throw Erros.naoEncontrado("Classe");
  if (classe.unlockLevel > nivel) throw Erros.semPermissao("Classe ainda não desbloqueada.");
  personagem.classId = classeId;
  return personagem;
}

// ─── xp / streak / conquistas ───────────────────────────────────────────────

function verificarEDesbloquearConquistas(characterId: string, estado: { nivel: number; streakDias: number; totalMissoes: number }) {
  const desbloqueadasIds = new Set(state.userAchievements.filter((a) => a.characterId === characterId).map((a) => a.achievementId));
  for (const c of achievementsCatalog) {
    if (desbloqueadasIds.has(c.id)) continue;
    let ok = false;
    if (c.conditionType === "nivel_alcancado") ok = estado.nivel >= c.conditionValue;
    else if (c.conditionType === "streak_dias") ok = estado.streakDias >= c.conditionValue;
    else if (c.conditionType === "missoes_concluidas") ok = estado.totalMissoes >= c.conditionValue;
    if (ok) state.userAchievements.push({ id: uid("ua"), characterId, achievementId: c.id, unlockedAt: new Date() });
  }
}

function processarGanhoXp(userId: string, xpBase: number): ResultadoXP {
  const personagem = requireCharacter(userId);
  const classe = classes.find((c) => c.id === personagem.classId);
  const bonusPct = classe?.xpBonusPct ?? 0;
  const resultado = calcularResultadoXP(personagem.currentXp, xpBase, bonusPct);
  personagem.currentXp = resultado.xpDepois;
  personagem.level = resultado.nivelDepois;

  const totalMissoes = state.userMissions.filter((m) => m.characterId === personagem.id && m.status === "concluida").length;
  const usuario = state.users.get(userId);
  verificarEDesbloquearConquistas(personagem.id, { nivel: resultado.nivelDepois, streakDias: usuario?.streakDays ?? 0, totalMissoes });

  return resultado;
}

function registrarStreakDia(userId: string) {
  const usuario = state.users.get(userId);
  if (!usuario) throw Erros.naoEncontrado("Usuário");
  const hoje = hojeISO();
  const ultimo = usuario.lastActiveAt ? new Date(usuario.lastActiveAt).toISOString().split("T")[0] : undefined;
  if (ultimo === hoje) return { diasSequencia: usuario.streakDays };
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);
  const ontemStr = ontem.toISOString().split("T")[0];
  usuario.streakDays = ultimo === ontemStr ? usuario.streakDays + 1 : 1;
  usuario.lastActiveAt = new Date();
  return { diasSequencia: usuario.streakDays };
}

export function streakAtual(userId: string) {
  const u = state.users.get(userId);
  if (!u) throw Erros.naoEncontrado("Usuário");
  return { diasSequencia: u.streakDays, ultimoAcesso: u.lastActiveAt };
}

export function minhasConquistas(userId: string) {
  const p = requireCharacter(userId);
  const desbloqueadas = state.userAchievements.filter((a) => a.characterId === p.id);
  const mapa = new Map(desbloqueadas.map((d) => [d.achievementId, d.unlockedAt] as const));
  return achievementsCatalog.map((c) => ({ ...c, desbloqueada: mapa.has(c.id), desbloquedaEm: mapa.get(c.id) ?? null }));
}

// ─── missões ────────────────────────────────────────────────────────────────

export function missoesHoje(userId: string) {
  const p = requireCharacter(userId);
  const hoje = hojeISO();
  return state.userMissions
    .filter((m) => m.characterId === p.id && m.assignedDate === hoje)
    .map((m) => ({ ...m, mission: missionsCatalog.find((c) => c.id === m.missionId)! }));
}

export function gerarMissoesHoje(userId: string) {
  const p = requireCharacter(userId);
  const hoje = hojeISO();
  const existentes = state.userMissions.filter((m) => m.characterId === p.id && m.assignedDate === hoje);
  if (existentes.length > 0) throw Erros.conflito("Missões do dia já foram geradas.");
  const embaralhadas = [...missionsCatalog].sort(() => Math.random() - 0.5).slice(0, 3);
  return embaralhadas.map((m) => {
    const um: MockUserMission = { id: uid("um"), characterId: p.id, missionId: m.id, status: "pendente", assignedDate: hoje, completedAt: null };
    state.userMissions.push(um);
    return { ...um, mission: m };
  });
}

export function concluirMissao(userId: string, missaoUsuarioId: string) {
  const p = requireCharacter(userId);
  const um = state.userMissions.find((m) => m.id === missaoUsuarioId && m.characterId === p.id);
  if (!um) throw Erros.naoEncontrado("Missão");
  if (um.status !== "pendente") throw Erros.requisicaoInvalida("Missão já concluída ou expirada.");
  um.status = "concluida";
  um.completedAt = new Date();
  const missao = missionsCatalog.find((m) => m.id === um.missionId)!;
  const xp = processarGanhoXp(userId, missao.xpReward);
  registrarStreakDia(userId);
  return { xp };
}

// ─── atividades ─────────────────────────────────────────────────────────────

export function registrarAtividade(userId: string, input: { tipoAtividade: string; duracaoMinutos: number; distanciaKm?: number; intensidade: string }) {
  const p = requireCharacter(userId);
  const calorias = estimarCalorias(input.tipoAtividade, input.duracaoMinutos, input.intensidade);
  const atividade: MockActivityLog = {
    id: uid("act"), characterId: p.id, activityType: input.tipoAtividade, durationMinutes: input.duracaoMinutos,
    distanceKm: input.distanciaKm ?? null, intensity: input.intensidade, xpEarned: calorias, loggedAt: new Date(),
  };
  state.activityLogs.push(atividade);
  const xp = processarGanhoXp(userId, calorias);
  registrarStreakDia(userId);
  return { atividade, xp };
}

// ─── saúde ──────────────────────────────────────────────────────────────────

export function registrarSaude(userId: string, input: {
  data: string; passos: number; distanciaKm?: number; frequenciaCardiacaMedia?: number;
  fonte: "healthkit" | "health_connect";
}) {
  const p = requireCharacter(userId);
  const existente = state.healthMetrics.find((m) => m.characterId === p.id && m.date === input.data);
  if (existente) {
    existente.steps = input.passos;
    existente.distanceKm = input.distanciaKm ?? null;
    existente.avgHeartRateBpm = input.frequenciaCardiacaMedia ?? null;
    existente.source = input.fonte;
    existente.syncedAt = new Date();
    return existente;
  }
  const registro: MockHealthMetric = {
    id: uid("health"), characterId: p.id, date: input.data, steps: input.passos,
    distanceKm: input.distanciaKm ?? null, avgHeartRateBpm: input.frequenciaCardiacaMedia ?? null,
    source: input.fonte, syncedAt: new Date(),
  };
  state.healthMetrics.push(registro);
  return registro;
}

export function historicoSaude(userId: string, dias: number) {
  const p = requireCharacter(userId);
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  const desdeStr = desde.toISOString().split("T")[0];
  return state.healthMetrics
    .filter((m) => m.characterId === p.id && m.date >= desdeStr)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// ─── guildas ────────────────────────────────────────────────────────────────

function guildComMembros(g: MockGuild) {
  return { ...g, members: state.guildMembers.filter((m) => m.guildId === g.id) };
}
function guildComMembrosDetalhado(g: MockGuild) {
  return {
    ...g,
    members: state.guildMembers
      .filter((m) => m.guildId === g.id)
      .map((m) => ({ ...m, character: joinRaceClass(state.characters.get(m.characterId)!) })),
  };
}

export function listarGuildas() {
  return [...state.guilds.values()].map(guildComMembros);
}

export function minhaGuilda(userId: string) {
  const p = requireCharacter(userId);
  const membro = state.guildMembers.find((m) => m.characterId === p.id);
  if (!membro) return null;
  const g = state.guilds.get(membro.guildId)!;
  return guildComMembrosDetalhado(g);
}

export function criarGuilda(userId: string, input: { nome: string; descricao?: string; emblema?: string }) {
  const p = requireCharacter(userId);
  const g: MockGuild = { id: uid("guild"), name: input.nome, description: input.descricao ?? null, emblem: input.emblema ?? "escudo", leaderId: p.id, totalXp: 0 };
  state.guilds.set(g.id, g);
  state.guildMembers.push({ id: uid("gm"), guildId: g.id, characterId: p.id, role: "lider" });
  return g;
}

export function entrarGuilda(userId: string, guildaId: string) {
  const p = requireCharacter(userId);
  const g = state.guilds.get(guildaId);
  if (!g) throw Erros.naoEncontrado("Guilda");
  const membro: MockGuildMember = { id: uid("gm"), guildId: guildaId, characterId: p.id, role: "membro" };
  state.guildMembers.push(membro);
  return membro;
}

export function sairGuilda(userId: string, guildaId: string) {
  const p = requireCharacter(userId);
  state.guildMembers = state.guildMembers.filter((m) => !(m.guildId === guildaId && m.characterId === p.id));
  return { sucesso: true };
}

export function buscarPersonagemParaConvite(userId: string, nome: string) {
  const p = requireCharacter(userId);
  const termo = nome.toLowerCase();
  return [...state.characters.values()]
    .filter((c) => c.id !== p.id && c.name.toLowerCase().includes(termo))
    .slice(0, 10)
    .map(joinRaceClass);
}

export function convidarParaGuilda(userId: string, guildaId: string, personagemAlvoId: string) {
  const p = requireCharacter(userId);
  const g = state.guilds.get(guildaId);
  if (!g) throw Erros.naoEncontrado("Guilda");
  if (g.leaderId !== p.id) throw Erros.semPermissao("Apenas o líder pode convidar membros.");
  if (personagemAlvoId === p.id) throw Erros.requisicaoInvalida("Você já lidera esta guilda.");
  const alvo = state.characters.get(personagemAlvoId);
  if (!alvo) throw Erros.naoEncontrado("Personagem");
  const membrosAtuais = state.guildMembers.filter((m) => m.guildId === guildaId);
  if (membrosAtuais.length >= MAX_MEMBROS_GUILDA) throw Erros.conflito("A guilda está cheia.");
  if (membrosAtuais.some((m) => m.characterId === personagemAlvoId)) throw Erros.conflito("Esse personagem já está na guilda.");
  if (state.guildInvites.some((i) => i.guildId === guildaId && i.characterId === personagemAlvoId && i.status === "pendente")) {
    throw Erros.conflito("Esse personagem já tem um convite pendente para esta guilda.");
  }
  const convite: MockGuildInvite = { id: uid("gi"), guildId: guildaId, characterId: personagemAlvoId, convidadoPorId: p.id, status: "pendente", createdAt: new Date() };
  state.guildInvites.push(convite);
  return convite;
}

export function listarConvitesPendentes(userId: string) {
  const p = requireCharacter(userId);
  return state.guildInvites
    .filter((i) => i.characterId === p.id && i.status === "pendente")
    .map((i) => ({ ...i, guild: state.guilds.get(i.guildId)!, convidadoPor: state.characters.get(i.convidadoPorId)! }));
}

export function responderConvite(userId: string, conviteId: string, aceitar: boolean) {
  const p = requireCharacter(userId);
  const convite = state.guildInvites.find((i) => i.id === conviteId);
  if (!convite) throw Erros.naoEncontrado("Convite");
  if (convite.characterId !== p.id) throw Erros.semPermissao("Este convite não é seu.");
  if (convite.status !== "pendente") throw Erros.conflito("Este convite já foi respondido.");
  if (!aceitar) {
    convite.status = "recusado";
    return { sucesso: true };
  }
  const jaTemGuilda = state.guildMembers.some((m) => m.characterId === p.id);
  if (jaTemGuilda) throw Erros.conflito("Você já está em uma guilda. Saia dela antes de aceitar outro convite.");
  const g = state.guilds.get(convite.guildId);
  if (!g) throw Erros.naoEncontrado("Guilda");
  const membrosAtuais = state.guildMembers.filter((m) => m.guildId === g.id);
  if (membrosAtuais.length >= MAX_MEMBROS_GUILDA) throw Erros.conflito("A guilda está cheia.");
  state.guildMembers.push({ id: uid("gm"), guildId: g.id, characterId: p.id, role: "membro" });
  convite.status = "aceito";
  return { sucesso: true };
}
