const classIconMap = {
  APRENDIZ: require("../../assets/class-icons/APRENDIZ.png"),
  GUERREIRO: require("../../assets/class-icons/GUERREIRO.png"),
  MAGO: require("../../assets/class-icons/MAGO.png"),
  MONGE: require("../../assets/class-icons/MONGE.png"),
  PATRULHEIRO: require("../../assets/class-icons/PATRULHEIRO.png"),
} as const;

type ClassIconKey = keyof typeof classIconMap;

const strip = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().trim();

export function getClassIcon(classe: string | null | undefined) {
  const key = strip(classe ?? "APRENDIZ") as ClassIconKey;
  return classIconMap[key] ?? classIconMap.APRENDIZ;
}
