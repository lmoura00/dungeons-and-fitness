// Curva de XP — precisa espelhar back/src/lib/xp-formula.ts.
//   custoDoNivel(n) = XP para ir do nível n ao n+1 = 1.000 + 400 * (n - 1)
// Nível 1→2 custa 1.000; cada nível seguinte pede 400 XP a mais.
export const XP_BASE_NIVEL = 1000;
export const XP_INCREMENTO_NIVEL = 400;

export const custoDoNivel = (nivel: number) =>
  XP_BASE_NIVEL + XP_INCREMENTO_NIVEL * (nivel - 1);

// XP total acumulado para alcançar um nível (soma dos custos dos níveis anteriores).
export const xpAcumuladoParaNivel = (nivel: number) => {
  const n = Math.max(0, nivel - 1);
  return XP_BASE_NIVEL * n + (XP_INCREMENTO_NIVEL * n * (n - 1)) / 2;
};

export const calcularNivel = (xp: number) => {
  let nivel = 1;
  while (nivel < 1000 && xpAcumuladoParaNivel(nivel + 1) <= xp) nivel++;
  return nivel;
};

export const calcularXpNoNivel = (xp: number) =>
  xp - xpAcumuladoParaNivel(calcularNivel(xp));

export function calcularPatamar(nivel: number): string {
  if (nivel <= 10) return "Iniciante";
  if (nivel <= 20) return "Aventureiro";
  if (nivel <= 30) return "Herói";
  return "Lendário";
}

// Texto exibido no InfoButton do card de XP.
export const EXPLICACAO_XP = [
  "Cada caloria que você queima em treinos e atividades vale 1 XP.",
  `A barra mostra seu progresso dentro do nível atual. Cada nível pede mais XP que o anterior: o nível 1→2 custa ${XP_BASE_NIVEL.toLocaleString("pt-BR")} XP e cada nível seguinte pede ${XP_INCREMENTO_NIVEL} a mais.`,
  "Ao encher a barra você sobe de nível. A cada 10 níveis você muda de patamar (Iniciante → Aventureiro → Herói → Lendário) e o avatar evolui.",
];
