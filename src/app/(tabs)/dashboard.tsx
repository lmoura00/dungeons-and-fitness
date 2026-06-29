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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { ProgressBar } from "../../components/ProgressBar";
import { trpc } from "../../lib/trpc";
import { getAvatar } from "../../utils/getAvatar";

const XP_POR_NIVEL = 3000;

function calcularPatamar(nivel: number): string {
  if (nivel <= 10) return "Iniciante";
  if (nivel <= 20) return "Aventureiro";
  if (nivel <= 30) return "Herói";
  return "Lendário";
}

function getSaudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

const ATRIBUTOS = [
  { key: "strength", label: "FOR", ionicon: "barbell",  color: Colors.statStrength },
  { key: "agility",  label: "AGI", ionicon: "flash",    color: Colors.statAgility  },
  { key: "focus",    label: "FOC", ionicon: "eye",      color: Colors.statFocus    },
  { key: "energy",   label: "VIT", ionicon: "heart",    color: Colors.statVitality },
] as const;

export default function DashboardScreen() {
  const { data: personagem, isLoading } = trpc.personagens.meuPersonagem.useQuery();
  const { data: usuario } = trpc.usuarios.meuPerfil.useQuery();
  const { data: streak } = trpc.streak.atual.useQuery();

  const nivel = personagem ? Math.floor(personagem.currentXp / XP_POR_NIVEL) + 1 : 1;
  const xpNoNivel = personagem ? personagem.currentXp % XP_POR_NIVEL : 0;
  const progresso = xpNoNivel / XP_POR_NIVEL;
  const patamar = calcularPatamar(nivel);
  const diasSequencia = streak?.diasSequencia ?? 0;
  const streakAtivo = diasSequencia > 0;
  const attrs = personagem?.attributes;
  const avatarSource = getAvatar(personagem?.class?.name, personagem?.race?.name, usuario?.gender);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Image source={avatarSource} style={styles.headerAvatar} />
            <Text style={styles.headerGreeting}>{getSaudacao()}</Text>
            <TouchableOpacity style={styles.bellButton}>
              <Ionicons name="notifications-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.heroTitle}>
            Hey, {personagem?.name ?? "Aventureiro"}
          </Text>
          <Text style={styles.heroSub}>
            {isLoading ? "Carregando..." : `${personagem?.race?.name ?? "—"} · ${personagem?.class?.name ?? "—"} · Nível ${nivel}`}
          </Text>
        </View>

        {/* Featured Card */}
        <View style={styles.featuredCard}>
          <LinearGradient
            colors={["#3D2208", "#150A02"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuredGradient}
          >
            <View style={styles.featuredLeft}>
              <View style={styles.featuredBadge}>
                <Ionicons name="flash" size={11} color={Colors.primary} />
                <Text style={styles.featuredBadgeText}>{patamar}</Text>
              </View>
              <Text style={styles.featuredTitle}>{personagem?.name ?? "Aventureiro"}</Text>
              <Text style={styles.featuredSub}>
                {xpNoNivel.toLocaleString("pt-BR")} / {XP_POR_NIVEL.toLocaleString("pt-BR")} XP
              </Text>
              <View style={styles.featuredBarWrap}>
                <ProgressBar progress={progresso} />
              </View>
            </View>
            <Image
              source={avatarSource}
              style={styles.featuredAvatar}
              resizeMode="contain"
            />
          </LinearGradient>
        </View>

        {/* Streak row */}
        <View style={styles.streakRow}>
          <View style={[styles.streakCard, streakAtivo && styles.streakCardAtivo]}>
            <Ionicons name="flame" size={20} color={streakAtivo ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.streakValue, streakAtivo && styles.streakValueAtivo]}>
              {diasSequencia}
            </Text>
            <Text style={styles.streakLabel}>Streak</Text>
          </View>
          <View style={styles.streakCard}>
            <Ionicons name="star" size={20} color={Colors.gold} />
            <Text style={styles.streakValue}>
              {personagem?.currentXp?.toLocaleString("pt-BR") ?? "0"}
            </Text>
            <Text style={styles.streakLabel}>XP Total</Text>
          </View>
          <View style={styles.streakCard}>
            <Ionicons name="trending-up" size={20} color={Colors.statAgility} />
            <Text style={styles.streakValue}>{nivel}</Text>
            <Text style={styles.streakLabel}>Nível</Text>
          </View>
        </View>

        {/* Daily Summary */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RESUMO DE HOJE</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/quests")}>
            <Text style={styles.sectionLink}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.summaryCard}
          onPress={() => router.push("/(tabs)/quests")}
          activeOpacity={0.8}
        >
          <View style={[styles.summaryIconWrap, { backgroundColor: Colors.primaryMuted }]}>
            <Ionicons name="shield" size={20} color={Colors.primary} />
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.summaryTitle}>Missões do Dia</Text>
            <Text style={styles.summarySub}>Complete para ganhar XP e manter o streak</Text>
          </View>
          <View style={[styles.summaryBadge, { backgroundColor: Colors.primaryMuted }]}>
            <Text style={[styles.summaryBadgeText, { color: Colors.primary }]}>Missões</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.summaryCard}
          onPress={() => router.push("/(tabs)/log-activity")}
          activeOpacity={0.8}
        >
          <View style={[styles.summaryIconWrap, { backgroundColor: "#1A3A2A" }]}>
            <Ionicons name="add-circle" size={20} color={Colors.statAgility} />
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.summaryTitle}>Registrar Atividade</Text>
            <Text style={styles.summarySub}>Ganhe XP e atributos com cada treino</Text>
          </View>
          <View style={[styles.summaryBadge, { backgroundColor: "#1A3A2A" }]}>
            <Text style={[styles.summaryBadgeText, { color: Colors.statAgility }]}>XP</Text>
          </View>
        </TouchableOpacity>

        {/* Attributes */}
        {attrs && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>ATRIBUTOS</Text>
            </View>
            <View style={styles.attrsCard}>
              {ATRIBUTOS.map((a) => (
                <View key={a.key} style={styles.attrRow}>
                  <Ionicons name={a.ionicon as any} size={18} color={a.color} />
                  <Text style={styles.attrLabel}>{a.label}</Text>
                  <View style={styles.attrBarBg}>
                    <View style={[styles.attrBarFill, { width: `${Math.min((attrs[a.key] / 100) * 100, 100)}%`, backgroundColor: a.color }]} />
                  </View>
                  <Text style={[styles.attrValue, { color: a.color }]}>{attrs[a.key]}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingBottom: 32,
  },

  /* Header */
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 12 : 48,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1.5,
    borderColor: Colors.primaryDark,
  },
  headerGreeting: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: 30,
    fontWeight: "bold",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSub: {
    color: Colors.textMuted,
    fontSize: 14,
  },

  /* Featured card */
  featuredCard: {
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  featuredGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    minHeight: 140,
  },
  featuredLeft: {
    flex: 1,
    gap: 6,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryMuted,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    marginBottom: 4,
  },
  featuredBadgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  featuredTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
  },
  featuredSub: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  featuredBarWrap: {
    marginTop: 4,
    width: "85%",
  },
  featuredAvatar: {
    width: 90,
    height: 110,
    borderRadius: 8,
  },

  /* Streak row */
  streakRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  streakCard: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  streakCardAtivo: {
    borderColor: Colors.primaryDark,
    backgroundColor: Colors.primaryMuted,
  },
  streakValue: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },
  streakValueAtivo: {
    color: Colors.primary,
  },
  streakLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  /* Section headers */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  sectionLink: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },

  /* Summary cards */
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceDark,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  summaryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryText: {
    flex: 1,
  },
  summaryTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  summarySub: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  summaryBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  summaryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  /* Attributes */
  attrsCard: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  attrRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  attrLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    width: 30,
  },
  attrBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  attrBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  attrValue: {
    fontSize: 13,
    fontWeight: "bold",
    width: 28,
    textAlign: "right",
  },
});
