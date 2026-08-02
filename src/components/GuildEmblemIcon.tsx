import React from "react";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

export type GuildEmblem = "escudo" | "espada" | "dragao" | "elmo";

export const GUILD_EMBLEMAS: { key: GuildEmblem; label: string }[] = [
  { key: "escudo", label: "Escudo" },
  { key: "espada", label: "Espada" },
  { key: "dragao", label: "Dragão" },
  { key: "elmo", label: "Elmo" },
];

interface GuildEmblemIconProps {
  emblem: GuildEmblem | null | undefined;
  size?: number;
  color?: string;
}

export function GuildEmblemIcon({ emblem, size = 40, color = Colors.gold }: GuildEmblemIconProps) {
  switch (emblem) {
    case "espada":
      return <MaterialCommunityIcons name="sword" size={size} color={color} />;
    case "dragao":
      return <FontAwesome5 name="dragon" solid size={size * 0.9} color={color} />;
    case "elmo":
      return <MaterialCommunityIcons name="chess-knight" size={size} color={color} />;
    case "escudo":
    default:
      return <Ionicons name="shield" size={size} color={color} />;
  }
}
