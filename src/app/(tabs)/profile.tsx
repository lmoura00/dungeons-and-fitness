import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { ProgressBar } from "../../components/ProgressBar";
import { trpc } from "../../lib/trpc";
import { limparSessao } from "../../lib/auth";

const XP_POR_NIVEL = 3000;

function calcularPatamar(nivel: number): string {
  if (nivel <= 10) return "Iniciante";
  if (nivel <= 20) return "Aventureiro";
  if (nivel <= 30) return "Herói";
  return "Lendário";
}

const ATRIBUTOS = [
  { key: "strength", label: "Força",      icon: "💪", color: "#F44336" },
  { key: "agility",  label: "Agilidade",  icon: "⚡", color: "#2196F3" },
  { key: "focus",    label: "Foco",        icon: "🎯", color: "#9C27B0" },
  { key: "energy",   label: "Vitalidade", icon: "❤️", color: "#4CAF50" },
] as const;

export default function ProfileScreen() {
  const { data: personagem, isLoading } = trpc.personagens.meuPersonagem.useQuery();
  const { data: conquistas } = trpc.conquistasUsuario.minhasConquistas.useQuery();

  const nivel = personagem ? Math.floor(personagem.currentXp / XP_POR_NIVEL) + 1 : 1;
  const xpNoNivel = personagem ? personagem.currentXp % XP_POR_NIVEL : 0;
  const progresso = xpNoNivel / XP_POR_NIVEL;
  const patamar = calcularPatamar(nivel);
  const attrs = personagem?.attributes;

  const handleSair = () => {
    Alert.alert("Sair", "Deseja encerrar sua sessão?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => limparSessao() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/dashboard")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ficha</Text>
        <TouchableOpacity style={styles.sairButton} onPress={handleSair}>
          <Ionicons name="log-out-outline" size={18} color={Colors.textMuted} />
          <Text style={styles.sairText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarGlow}>
            <View style={styles.avatarCircle}>
              {isLoading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <Image
                  source={{
                    uri: `https://api.dicebear.com/8.x/adventurer/png?seed=${personagem?.name ?? "Hero"}&backgroundColor=F5A623`,
                  }}
                  style={styles.avatarImage}
                />
              )}
            </View>
          </View>
          <Text style={styles.characterName}>{personagem?.name ?? "Aventureiro"}</Text>
          <Text style={styles.characterSub}>
            {isLoading ? "..." : `${personagem?.race?.name ?? "—"} · ${personagem?.class?.name ?? "—"}`}
          </Text>
          <View style={styles.patamarBadge}>
            <Text style={styles.patamarBadgeText}>{patamar} · Nível {nivel}</Text>
          </View>
        </View>

        {/* XP */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>PROGRESSO</Text>
            <Text style={styles.cardValue}>
              {xpNoNivel.toLocaleString("pt-BR")} / {XP_POR_NIVEL.toLocaleString("pt-BR")} XP
            </Text>
          </View>
          <ProgressBar progress={progresso} />
          <View style={styles.xpTotalRow}>
            <Text style={styles.xpTotalLabel}>XP Total acumulado</Text>
            <Text style={styles.xpTotalValue}>{personagem?.currentXp?.toLocaleString("pt-BR") ?? "0"}</Text>
          </View>
        </View>

        {/* Attributes */}
        {attrs && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ATRIBUTOS</Text>
            <View style={styles.attrsList}>
              {ATRIBUTOS.map((a) => (
                <View key={a.key} style={styles.attrRow}>
                  <View style={styles.attrLeft}>
                    <Text style={styles.attrEmoji}>{a.icon}</Text>
                    <Text style={styles.attrLabel}>{a.label}</Text>
                  </View>
                  <View style={styles.attrRight}>
                    <View style={[styles.attrBar, { width: `${Math.min((attrs[a.key] / 20) * 100, 100)}%`, backgroundColor: a.color }]} />
                    <Text style={[styles.attrValue, { color: a.color }]}>{attrs[a.key]}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Conquistas */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>CONQUISTAS</Text>
            <Text style={styles.cardValue}>{conquistas?.length ?? 0} desbloqueadas</Text>
          </View>
          {!conquistas || conquistas.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma conquista ainda. Continue jogando!</Text>
          ) : (
            <View style={styles.conquistasList}>
              {conquistas.filter((c) => c.achievement != null).map((c) => (
                <View key={c.id} style={styles.conquistaItem}>
                  <Text style={styles.conquistaIcon}>{c.achievement.icon ?? "🏆"}</Text>
                  <View style={styles.conquistaInfo}>
                    <Text style={styles.conquistaTitle}>{c.achievement.title}</Text>
                    <Text style={styles.conquistaDesc}>{c.achievement.description}</Text>
                  </View>
                  <Text style={styles.conquistaXp}>+{c.achievement.xpReward}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceDark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
  },
  sairButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceDark,
  },
  sairText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
  avatarCard: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  avatarGlow: {
    padding: 4,
    borderRadius: 60,
    backgroundColor: "rgba(245, 166, 35, 0.12)",
    marginBottom: 4,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
    overflow: "hidden",
  },
  avatarImage: { width: 100, height: 100 },
  characterName: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: "bold",
  },
  characterSub: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  patamarBadge: {
    backgroundColor: "rgba(245, 166, 35, 0.12)",
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(245, 166, 35, 0.3)",
    marginTop: 4,
  },
  patamarBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  cardValue: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "bold",
  },
  xpTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  xpTotalLabel: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  xpTotalValue: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  attrsList: {
    gap: 12,
  },
  attrRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  attrLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: 110,
  },
  attrEmoji: { fontSize: 16 },
  attrLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  attrRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  attrBar: {
    height: 6,
    borderRadius: 3,
    flex: 0,
    minWidth: 4,
  },
  attrValue: {
    fontSize: 14,
    fontWeight: "bold",
    width: 28,
    textAlign: "right",
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 8,
  },
  conquistasList: {
    gap: 10,
  },
  conquistaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  conquistaIcon: { fontSize: 24 },
  conquistaInfo: { flex: 1 },
  conquistaTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  conquistaDesc: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  conquistaXp: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "bold",
  },
});
