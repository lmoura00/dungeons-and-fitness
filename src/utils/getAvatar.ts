const avatarMap = {
  ANAO_APRENDIZ_M:    require("../../assets/avatar/ANAO_APRENDIZ_M.png"),
  ANAO_APRENDIZ_F:    require("../../assets/avatar/ANAO_APRENDIZ_F.png"),
  ANAO_GUERREIRO_M:   require("../../assets/avatar/ANAO_GUERREIRO_M.png"),
  ANAO_GUERREIRO_F:   require("../../assets/avatar/ANAO_GUERREIRO_F.png"),
  ANAO_MAGO_M:        require("../../assets/avatar/ANAO_MAGO_M.png"),
  ANAO_MAGO_F:        require("../../assets/avatar/ANAO_MAGO_F.png"),
  ANAO_MONGE_M:       require("../../assets/avatar/ANAO_MONGE_M.png"),
  ANAO_MONGE_F:       require("../../assets/avatar/ANAO_MONGE_F.png"),
  ANAO_PATRULHEIRO_M: require("../../assets/avatar/ANAO_PATRULHEIRO_M.png"),
  ANAO_PATRULHEIRO_F: require("../../assets/avatar/ANAO_PATRULHEIRO_F.png"),

  ELFO_APRENDIZ_M:    require("../../assets/avatar/ELFO_APRENDIZ_M.png"),
  ELFO_APRENDIZ_F:    require("../../assets/avatar/ELFO_APRENDIZ_F.png"),
  ELFO_GUERREIRO_M:   require("../../assets/avatar/ELFO_GUERREIRO_M.png"),
  ELFO_GUERREIRO_F:   require("../../assets/avatar/ELFO_GUERREIRO_F.png"),
  ELFO_MAGO_M:        require("../../assets/avatar/ELFO_MAGO_M.png"),
  ELFO_MAGO_F:        require("../../assets/avatar/ELFO_MAGO_F.png"),
  ELFO_MONGE_M:       require("../../assets/avatar/ELFO_MONGE_M.png"),
  ELFO_MONGE_F:       require("../../assets/avatar/ELFO_MONGE_F.png"),
  ELFO_PATRULHEIRO_M: require("../../assets/avatar/ELFO_PATRULHEIRO_M.png"),
  ELFO_PATRULHEIRO_F: require("../../assets/avatar/ELFO_PATRULHEIRO_F.png"),

  HUMANO_APRENDIZ_M:    require("../../assets/avatar/HUMANO_APRENDIZ_M.png"),
  HUMANO_APRENDIZ_F:    require("../../assets/avatar/HUMANO_APRENDIZ_F.png"),
  HUMANO_GUERREIRO_M:   require("../../assets/avatar/HUMANO_GUERREIRO_M.png"),
  HUMANO_GUERREIRO_F:   require("../../assets/avatar/HUMANO_GUERREIRO_F.png"),
  HUMANO_MAGO_M:        require("../../assets/avatar/HUMANO_MAGO_M.png"),
  HUMANO_MAGO_F:        require("../../assets/avatar/HUMANO_MAGO_F.png"),
  HUMANO_PATRULHEIRO_M: require("../../assets/avatar/HUMANO_PATRULHEIRO_M.png"),
  HUMANO_PATRULHEIRO_F: require("../../assets/avatar/HUMANO_PATRULHEIRO_F.png"),
} as const;

type AvatarKey = keyof typeof avatarMap;

const strip = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().trim();

export function getAvatar(
  classe: string | null | undefined,
  raca: string | null | undefined,
  genero: string | null | undefined,
) {
  const g = strip(genero ?? "").startsWith("F") ? "F" : "M";
  const key = `${strip(raca ?? "ANAO")}_${strip(classe ?? "APRENDIZ")}_${g}` as AvatarKey;
  return avatarMap[key] ?? avatarMap["ANAO_APRENDIZ_M"];
}

export function getAvatarByKey(key: string | null | undefined) {
  if (key && key in avatarMap) return avatarMap[key as AvatarKey];
  return avatarMap["ANAO_APRENDIZ_M"];
}

export function getAvatarsByRace(raca: string | null | undefined) {
  const prefix = strip(raca ?? "ANAO") + "_";
  return (Object.keys(avatarMap) as AvatarKey[])
    .filter((k) => k.startsWith(prefix))
    .map((k) => ({ key: k, source: avatarMap[k] }));
}
