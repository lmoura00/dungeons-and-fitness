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
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { ProgressBar } from "../../components/ProgressBar";
import { trpc } from "../../lib/trpc";

const XP_POR_NIVEL = 3000;

function calcularPatamar(nivel: number): string {
  if (nivel <= 10) return "Iniciante";
  if (nivel <= 20) return "Aventureiro";
  if (nivel <= 30) return "Herói";
  return "Lendário";
}

const ATRIBUTOS = [
  { key: "strength", label: "FOR", icon: "💪" },
  { key: "agility",  label: "AGI", icon: "⚡" },
  { key: "focus",    label: "FOC", icon: "🎯" },
  { key: "energy",   label: "VIT", icon: "❤️" },
] as const;

const NAV_ITEMS = [
  { id: "dashboard",    label: "Dashboard", icon: "home",        route: "/(tabs)/dashboard" },
  { id: "quests",       label: "Missões",   icon: "shield",      route: "/(tabs)/quests" },
  { id: "log-activity", label: "Registrar", icon: "add-circle",  route: "/(tabs)/log-activity" },
  { id: "profile",      label: "Perfil",    icon: "person",      route: "/(tabs)/profile" },
] as const;

export default function DashboardScreen() {
  const { data: personagem, isLoading } = trpc.personagens.meuPersonagem.useQuery();
  const { data: streak } = trpc.streak.atual.useQuery();

  const nivel = personagem ? Math.floor(personagem.currentXp / XP_POR_NIVEL) + 1 : 1;
  const xpNoNivel = personagem ? personagem.currentXp % XP_POR_NIVEL : 0;
  const progresso = xpNoNivel / XP_POR_NIVEL;
  const patamar = calcularPatamar(nivel);
  const diasSequencia = streak?.diasSequencia ?? 0;
  const streakAtivo = diasSequencia > 0;
  const attrs = personagem?.attributes;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../../assets/logo_df_circulo 1.png")}
            style={styles.smallLogo}
          />
          <View>
            <Text style={styles.headerGreeting}>Bem-vindo de volta,</Text>
            <Text style={styles.headerName}>{personagem?.name ?? "Aventureiro"}</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.streakBadge, streakAtivo && styles.streakBadgeAtivo]}>
          <Text style={styles.streakIcon}>🔥</Text>
          <Text style={[styles.streakText, streakAtivo && styles.streakTextAtivo]}>
            {diasSequencia}d
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.nav}
        style={styles.navContainer}
      >
        {NAV_ITEMS.map((item) => {
          const active = item.id === "dashboard";
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.navButton, active && styles.navButtonActive]}
              onPress={() => { if (!active) router.push(item.route as any); }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={item.icon as any}
                size={14}
                color={active ? Colors.background : Colors.primary}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Character Card */}
        <View style={styles.characterCard}>
          <View style={styles.cardLeft}>
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
          </View>

          <View style={styles.cardRight}>
            <View style={styles.patamarBadge}>
              <Text style={styles.patamarBadgeText}>{patamar}</Text>
            </View>
            <Text style={styles.characterName} numberOfLines={1}>
              {personagem?.name ?? "—"}
            </Text>
            <Text style={styles.characterSub}>
              {isLoading ? "..." : `${personagem?.race?.name ?? "—"} · ${personagem?.class?.name ?? "—"}`}
            </Text>
            <Text style={styles.levelLabel}>Nível {nivel}</Text>
          </View>
        </View>

        {/* XP Bar */}
        <View style={styles.xpSection}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpTitle}>Experiência</Text>
            <Text style={styles.xpValue}>
              {xpNoNivel.toLocaleString("pt-BR")} / {XP_POR_NIVEL.toLocaleString("pt-BR")} XP
            </Text>
          </View>
          <ProgressBar progress={progresso} />
          {nivel < 5 && (
            <Text style={styles.xpHint}>Nível 5 para desbloquear sua Classe</Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="star" size={18} color={Colors.primary} style={styles.statIcon} />
            <Text style={styles.statValue}>{personagem?.currentXp?.toLocaleString("pt-BR") ?? "0"}</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{diasSequencia}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Attributes */}
        {attrs && (
          <View style={styles.attrsCard}>
            <Text style={styles.sectionTitle}>ATRIBUTOS</Text>
            <View style={styles.attrsGrid}>
              {ATRIBUTOS.map((a) => (
                <View key={a.key} style={styles.attrItem}>
                  <Text style={styles.attrIcon}>{a.icon}</Text>
                  <Text style={styles.attrValue}>{attrs[a.key]}</Text>
                  <Text style={styles.attrLabel}>{a.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>AÇÕES RÁPIDAS</Text>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(tabs)/quests")}
          activeOpacity={0.8}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.actionEmoji}>⚔️</Text>
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Missões do Dia</Text>
            <Text style={styles.actionSub}>Complete para ganhar XP e manter o streak</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  smallLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerGreeting: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "500",
  },
  headerName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  streakBadgeAtivo: {
    borderColor: "#FF6B35",
    backgroundColor: "rgba(255, 107, 53, 0.12)",
  },
  streakIcon: {
    fontSize: 14,
  },
  streakText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "bold",
  },
  streakTextAtivo: {
    color: "#FF6B35",
  },
  navContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  nav: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceDark,
  },
  navButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  navLabel: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  navLabelActive: {
    color: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
  characterCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceDark,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 16,
  },
  cardLeft: {
    alignItems: "center",
  },
  avatarGlow: {
    padding: 3,
    borderRadius: 44,
    backgroundColor: "rgba(245, 166, 35, 0.15)",
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
    overflow: "hidden",
  },
  avatarImage: { width: 80, height: 80 },
  cardRight: {
    flex: 1,
    gap: 4,
  },
  patamarBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(245, 166, 35, 0.15)",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(245, 166, 35, 0.3)",
    marginBottom: 4,
  },
  patamarBadgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  characterName: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
  },
  characterSub: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  levelLabel: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  xpSection: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  xpTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  xpValue: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "bold",
  },
  xpHint: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: "right",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  statIcon: {
    marginBottom: 2,
  },
  statEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: "bold",
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  attrsCard: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  attrsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  attrItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  attrIcon: {
    fontSize: 20,
  },
  attrValue: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },
  attrLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 166, 35, 0.08)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 166, 35, 0.25)",
    gap: 14,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceDark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionEmoji: { fontSize: 20 },
  actionText: { flex: 1 },
  actionTitle: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 3,
  },
  actionSub: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
});
