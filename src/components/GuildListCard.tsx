import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../constants/Colors";
import { GuildEmblemIcon, type GuildEmblem } from "./GuildEmblemIcon";

export const MAX_MEMBROS_GUILDA = 10;

export interface GuildListCardGuilda {
  id: string;
  name: string;
  description: string | null;
  emblem: string;
  totalXp: number;
  members: unknown[];
}

type GuildListCardAction =
  | { type: "entrar"; onPress: () => void; pending: boolean; cheia: boolean }
  | { type: "sua-guilda"; onPress: () => void }
  | { type: "indisponivel" };

interface GuildListCardProps {
  guilda: GuildListCardGuilda;
  action: GuildListCardAction;
}

export function GuildListCard({ guilda, action }: GuildListCardProps) {
  const interativo = action.type === "entrar" || action.type === "sua-guilda";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={action.type === "entrar" ? action.onPress : action.type === "sua-guilda" ? action.onPress : undefined}
      disabled={!interativo || (action.type === "entrar" && (action.pending || action.cheia))}
      activeOpacity={interativo ? 0.7 : 1}
    >
      <View style={styles.crestSmall}>
        <LinearGradient
          colors={[Colors.gold, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.crestRing}
        >
          <View style={styles.crestInner}>
            <GuildEmblemIcon emblem={guilda.emblem as GuildEmblem} size={20} />
          </View>
        </LinearGradient>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{guilda.name}</Text>
        {guilda.description ? (
          <View style={styles.mottoTag}>
            <Text style={styles.mottoTagText} numberOfLines={1}>{guilda.description}</Text>
          </View>
        ) : null}
        <View style={styles.metaRow}>
          <Text style={styles.meta}>
            👥 {guilda.members.length}/{MAX_MEMBROS_GUILDA}
          </Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.xp}>{guilda.totalXp.toLocaleString("pt-BR")} XP</Text>
        </View>
      </View>

      {action.type === "entrar" ? (
        <View style={[styles.actionButton, action.cheia && styles.actionButtonMuted]}>
          {action.pending ? (
            <ActivityIndicator size="small" color={Colors.textOnPrimary} />
          ) : (
            <Text style={[styles.actionText, action.cheia && styles.actionTextMuted]}>
              {action.cheia ? "Cheia" : "Entrar"}
            </Text>
          )}
        </View>
      ) : action.type === "sua-guilda" ? (
        <View style={[styles.tag, styles.tagLeader]}>
          <Text style={[styles.tagText, styles.tagTextLeader]}>Sua guilda</Text>
        </View>
      ) : (
        <View style={[styles.actionButton, styles.actionButtonMuted]}>
          <Text style={[styles.actionText, styles.actionTextMuted]}>Indisponível</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  crestSmall: {},
  crestRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  crestInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceDark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.background,
  },
  info: {
    flex: 1,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "bold",
  },
  mottoTag: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryMuted,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
    maxWidth: "100%",
  },
  mottoTagText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontStyle: "italic",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  meta: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  metaDot: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  xp: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    minWidth: 76,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 34,
  },
  actionButtonMuted: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  actionText: {
    color: Colors.textOnPrimary,
    fontSize: 12,
    fontWeight: "bold",
  },
  actionTextMuted: {
    color: Colors.textMuted,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagLeader: {
    backgroundColor: "rgba(212, 168, 75, 0.15)",
    borderColor: Colors.gold,
  },
  tagText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  tagTextLeader: {
    color: Colors.gold,
  },
});
