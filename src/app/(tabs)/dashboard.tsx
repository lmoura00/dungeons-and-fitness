import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { ProgressBar } from "../../components/ProgressBar";
import { PrimaryButton } from "../../components/PrimaryButton";
import { trpc } from "../../lib/trpc";
import { getAvatar } from "../../utils/getAvatar";
import { requestHealthPermissions, syncTodayHealthData } from "../../lib/health";

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
  const utils = trpc.useUtils();
  const [sincronizando, setSincronizando] = useState(false);

  const { data: personagem, isLoading } = trpc.personagens.meuPersonagem.useQuery();
  const { data: usuario } = trpc.usuarios.meuPerfil.useQuery();
  const { data: streak, isLoading: isLoadingStreak } = trpc.streak.atual.useQuery();
  const { data: saudeHistorico } = trpc.saude.historico.useQuery({ dias: 1 });
  const { data: naoLidas } = trpc.notificacoes.naoLidas.useQuery();

  const sincronizarMutation = trpc.saude.sincronizar.useMutation({
    onSuccess: () => utils.saude.historico.invalidate(),
    onError: (e) => Alert.alert("Erro ao sincronizar", e.message),
  });

  const handleSincronizarSaude = async () => {
    setSincronizando(true);
    try {
      const permitido = await requestHealthPermissions();
      if (!permitido) {
        Alert.alert("Permissão necessária", "Autorize o acesso aos dados de saúde para sincronizar.");
        return;
      }
      const dados = await syncTodayHealthData();
      const hoje = new Date().toISOString().split("T")[0];
      sincronizarMutation.mutate({
        data: hoje,
        passos: dados.steps,
        distanciaKm: dados.distanceKm,
        frequenciaCardiacaMedia: dados.avgHeartRateBpm,
        fonte: dados.source,
      });
    } catch (e: any) {
      Alert.alert("Erro ao ler dados de saúde", e?.message ?? "Tente novamente.");
    } finally {
      setSincronizando(false);
    }
  };

  const saudeHoje = saudeHistorico?.[0];

  const nivel = personagem ? Math.floor(personagem.currentXp / XP_POR_NIVEL) + 1 : 1;
  const xpNoNivel = personagem ? personagem.currentXp % XP_POR_NIVEL : 0;
  const progresso = xpNoNivel / XP_POR_NIVEL;
  const patamar = calcularPatamar(nivel);
  const diasSequencia = streak?.diasSequencia ?? 0;
  const streakAtivo = diasSequencia > 0;
  const attrs = personagem?.attributes;
  const avatarSource = getAvatar(personagem?.class?.name, personagem?.race?.name, personagem?.avatarGender);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
            <View style={styles.headerLeft}>
              <Image source={avatarSource} style={styles.headerAvatar} />
              <View>
                <Text style={styles.headerGreeting}>{getSaudacao()},</Text>
                <Text style={styles.headerName}>{personagem?.name ?? "Aventureiro"}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.bellButton}
              onPress={() => router.push("/(tabs)/notifications")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="notifications-outline" size={20} color={Colors.textSecondary} />
              {!!naoLidas?.total && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{naoLidas.total > 9 ? "9+" : naoLidas.total}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.headerBadges}>
            {isLoading ? (
              <Text style={styles.headerBadgesLoading}>Carregando...</Text>
            ) : (
              <>
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>{personagem?.race?.name ?? "—"}</Text>
                </View>
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>{personagem?.class?.name ?? "—"}</Text>
                </View>
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>Nível {nivel}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Featured Card */}
        <View style={styles.featuredCard}>
          <LinearGradient
            colors={["#3D2208", "#150A02"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuredGradient}
          >
            <View style={styles.avatarFrame}>
              <Image
                source={avatarSource}
                style={styles.featuredAvatar}
                resizeMode="cover"
              />
            </View>
            <View style={styles.featuredLeft}>
              <View style={styles.featuredBadge}>
                <Ionicons name="flash" size={11} color={Colors.primary} />
                <Text style={styles.featuredBadgeText}>{patamar}</Text>
              </View>
              <Text style={styles.featuredTitle}>{personagem?.class?.name ?? "Aventureiro"}</Text>
              <View style={styles.featuredBarWrap}>
                <Text style={styles.featuredSub}>
                  {xpNoNivel.toLocaleString("pt-BR")} / {XP_POR_NIVEL.toLocaleString("pt-BR")} XP
                </Text>
                <ProgressBar progress={progresso} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Streak row */}
        <View style={styles.streakRow}>
          <View style={[styles.streakCard, streakAtivo && styles.streakCardAtivo]}>
            <Ionicons name="flame" size={22} color={streakAtivo ? Colors.primary : Colors.textMuted} />
            {isLoadingStreak ? (
              <View style={styles.streakValueSkeleton} />
            ) : (
              <Text style={[styles.streakValue, streakAtivo && styles.streakValueAtivo]}>
                {diasSequencia}
              </Text>
            )}
            <Text style={styles.streakLabel}>Streak</Text>
          </View>
          <View style={styles.streakCard}>
            <Ionicons name="star" size={22} color={Colors.gold} />
            <Text style={styles.streakValue}>
              {personagem?.currentXp?.toLocaleString("pt-BR") ?? "0"}
            </Text>
            <Text style={styles.streakLabel}>XP Total</Text>
          </View>
          <View style={styles.streakCard}>
            <Ionicons name="trending-up" size={22} color={Colors.statAgility} />
            <Text style={styles.streakValue}>{nivel}</Text>
            <Text style={styles.streakLabel}>Nível</Text>
          </View>
        </View>

        {/* Saúde */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SAÚDE</Text>
        </View>
        <View style={styles.healthCard}>
          <View style={styles.healthStatsRow}>
            <View style={styles.healthStat}>
              <Ionicons name="footsteps" size={18} color={Colors.statAgility} />
              <Text style={styles.healthStatValue}>{saudeHoje?.steps?.toLocaleString("pt-BR") ?? "—"}</Text>
              <Text style={styles.healthStatLabel}>Passos</Text>
            </View>
            <View style={styles.healthStat}>
              <Ionicons name="navigate" size={18} color={Colors.statFocus} />
              <Text style={styles.healthStatValue}>
                {saudeHoje?.distanceKm != null ? `${saudeHoje.distanceKm.toFixed(1)} km` : "—"}
              </Text>
              <Text style={styles.healthStatLabel}>Distância</Text>
            </View>
            <View style={styles.healthStat}>
              <Ionicons name="heart" size={18} color={Colors.statVitality} />
              <Text style={styles.healthStatValue}>
                {saudeHoje?.avgHeartRateBpm != null ? `${saudeHoje.avgHeartRateBpm} bpm` : "—"}
              </Text>
              <Text style={styles.healthStatLabel}>FC Média</Text>
            </View>
          </View>
          <PrimaryButton
            title={sincronizando || sincronizarMutation.isPending ? "SINCRONIZANDO..." : "SINCRONIZAR SAÚDE"}
            onPress={handleSincronizarSaude}
            disabled={sincronizando || sincronizarMutation.isPending}
            variant="outline"
            style={styles.healthButton}
          />
        </View>

        {/* Ação Principal */}
        <TouchableOpacity
          style={styles.ctaWrapper}
          onPress={() => router.push("/(tabs)/log-activity")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryBase]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <View style={styles.ctaIconWrap}>
              <Ionicons name="add-circle" size={26} color={Colors.textOnPrimary} />
            </View>
            <View style={styles.ctaTextWrap}>
              <Text style={styles.ctaTitle}>Registrar Atividade</Text>
              <Text style={styles.ctaSub}>Ganhe XP e atributos com cada treino</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textOnPrimary} />
          </LinearGradient>
        </TouchableOpacity>

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
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 2,
    borderColor: Colors.primaryDark,
  },
  headerGreeting: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerName: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: -0.3,
  },
  headerBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  headerBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: "rgba(255, 178, 63, 0.4)",
  },
  headerBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  headerBadgesLoading: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 10,
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
  bellBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: Colors.crimson,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.surface,
  },
  bellBadgeText: {
    color: Colors.textPrimary,
    fontSize: 9,
    fontWeight: "bold",
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
  avatarFrame: {
    width: 96,
    height: 116,
    borderRadius: 14,
    backgroundColor: "#2A1B0E",
    borderWidth: 1,
    borderColor: "rgba(255, 178, 63, 0.35)",
    marginRight: 16,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
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
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  featuredSub: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  featuredBarWrap: {
    marginTop: 6,
    width: "100%",
  },
  featuredAvatar: {
    width: "100%",
    height: "100%",
  },

  /* Streak row */
  streakRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 20,
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
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
  streakValue: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },
  streakValueAtivo: {
    color: Colors.primary,
  },
  streakValueSkeleton: {
    width: 24,
    height: 18,
    borderRadius: 4,
    backgroundColor: Colors.surface,
  },
  streakLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  /* Ação principal (CTA) */
  ctaWrapper: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 14,
  },
  ctaIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(26, 15, 0, 0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  ctaTextWrap: {
    flex: 1,
  },
  ctaTitle: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  ctaSub: {
    color: Colors.textOnPrimary,
    opacity: 0.75,
    fontSize: 12,
    fontWeight: "500",
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
    gap: 12,
  },
  attrLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    width: 32,
  },
  attrBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  attrBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  attrValue: {
    fontSize: 15,
    fontWeight: "bold",
    width: 32,
    textAlign: "right",
  },

  /* Saúde */
  healthCard: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  healthStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  healthStat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  healthStatValue: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "bold",
  },
  healthStatLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  healthButton: {
    marginTop: 4,
    height: 44,
  },
});
