import React from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { Colors } from "../../constants/Colors";
import { ProgressBar } from "../../components/ProgressBar";
import { ScreenHeader } from "../../components/ScreenHeader";
import { trpc } from "../../lib/trpc";
import { limparSessao } from "../../lib/auth";
import { getAvatar } from "../../utils/getAvatar";

const XP_POR_NIVEL = 3000;

function calcularPatamar(nivel: number): string {
  if (nivel <= 10) return "Iniciante";
  if (nivel <= 20) return "Aventureiro";
  if (nivel <= 30) return "Herói";
  return "Lendário";
}

const ATRIBUTOS = [
  { key: "strength", label: "Força",      ionicon: "barbell", color: Colors.statStrength },
  { key: "agility",  label: "Agilidade",  ionicon: "flash",   color: Colors.statAgility  },
  { key: "focus",    label: "Foco",        ionicon: "eye",     color: Colors.statFocus    },
  { key: "energy",   label: "Vitalidade", ionicon: "heart",   color: Colors.statVitality },
] as const;

export default function ProfileScreen() {
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();
  const { data: personagem, isLoading } = trpc.personagens.meuPersonagem.useQuery();
  const { data: conquistas } = trpc.conquistasUsuario.minhasConquistas.useQuery();
  const { data: todasClasses } = trpc.classes.listar.useQuery();

  const nivel = personagem ? Math.floor(personagem.currentXp / XP_POR_NIVEL) + 1 : 1;
  const xpNoNivel = personagem ? personagem.currentXp % XP_POR_NIVEL : 0;
  const progresso = xpNoNivel / XP_POR_NIVEL;
  const patamar = calcularPatamar(nivel);
  const attrs = personagem?.attributes;
  const classeAtualId = personagem?.class?.id;
  const podeEscolherClasse = nivel >= 5;

  const trocarClasseMutation = trpc.personagens.trocarClasse.useMutation({
    onSuccess: () => utils.personagens.meuPersonagem.invalidate(),
    onError: (e) => Alert.alert("Erro", e.message),
  });

  const handleTrocarClasse = (classe: { id: string; name: string; unlockLevel: number }) => {
    if (classe.id === classeAtualId) return;
    if (!podeEscolherClasse || classe.unlockLevel > nivel) return;
    Alert.alert(
      "Trocar de Classe",
      `Deseja mudar para ${classe.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", onPress: () => trocarClasseMutation.mutate({ classeId: classe.id }) },
      ],
    );
  };

  const handleSair = () => {
    Alert.alert("Sair", "Deseja encerrar sua sessão?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: async () => { await limparSessao(); queryClient.clear(); router.replace("/(auth)"); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScreenHeader
        title="Ficha"
        style={styles.header}
        rightSlot={
          <TouchableOpacity style={styles.sairButton} onPress={handleSair}>
            <Ionicons name="log-out-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.sairText}>Sair</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarGlow}>
            <Image
              source={getAvatar(personagem?.class?.name, personagem?.race?.name, personagem?.avatarGender)}
              style={styles.avatarImage}
              resizeMode="contain"
            />
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

        {/* Class Selection */}
        {todasClasses && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>CLASSE</Text>
              {!podeEscolherClasse && (
                <View style={styles.classLockHint}>
                  <Ionicons name="lock-closed" size={11} color={Colors.textMuted} />
                  <Text style={styles.classLockHintText}>Desbloqueada no nível 5</Text>
                </View>
              )}
            </View>

            {todasClasses
              .filter((c) => c.unlockLevel === 0 || c.unlockLevel <= 5)
              .sort((a, b) => a.unlockLevel - b.unlockLevel)
              .map((classe) => {
                const isAtual = classe.id === classeAtualId;
                const isLocked = !podeEscolherClasse && classe.unlockLevel > 0;
                const isSelectable = podeEscolherClasse && classe.unlockLevel <= nivel && !isAtual;
                return (
                  <TouchableOpacity
                    key={classe.id}
                    style={[
                      styles.classeRow,
                      isAtual && styles.classeRowAtual,
                      isLocked && styles.classeRowLocked,
                    ]}
                    onPress={() => handleTrocarClasse(classe)}
                    activeOpacity={isSelectable ? 0.7 : 1}
                    disabled={isLocked || isAtual}
                  >
                    <Image
                      source={getAvatar(classe.name, personagem?.race?.name, personagem?.avatarGender)}
                      style={[styles.classeAvatar, isLocked && styles.classeAvatarLocked]}
                      resizeMode="contain"
                    />
                    <View style={styles.classeInfo}>
                      <Text style={[styles.classeName, isLocked && styles.classeNameLocked]}>
                        {classe.name}
                      </Text>
                      {classe.xpBonusPct > 0 && (
                        <Text style={[styles.classeBonus, isLocked && styles.classeBonusLocked]}>
                          +{Math.round(classe.xpBonusPct * 100)}% XP de {classe.xpBonusType}
                        </Text>
                      )}
                    </View>
                    {isAtual ? (
                      <View style={styles.classeAtualBadge}>
                        <Text style={styles.classeAtualBadgeText}>Atual</Text>
                      </View>
                    ) : isLocked ? (
                      <View style={styles.classeLockBadge}>
                        <Ionicons name="lock-closed" size={11} color={Colors.textMuted} />
                        <Text style={styles.classeLockText}>Nível 5</Text>
                      </View>
                    ) : (
                      <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
          </View>
        )}

        {/* Attributes */}
        {attrs && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ATRIBUTOS</Text>
            <View style={styles.attrsList}>
              {ATRIBUTOS.map((a) => (
                <View key={a.key} style={styles.attrRow}>
                  <View style={styles.attrLeft}>
                    <Ionicons name={a.ionicon as any} size={16} color={a.color} />
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
                  {c.achievement.icon ? (
                    <Text style={styles.conquistaIconEmoji}>{c.achievement.icon}</Text>
                  ) : (
                    <Ionicons name="trophy" size={24} color={Colors.gold} />
                  )}
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sairButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
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
    borderRadius: 10,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  avatarGlow: {
    padding: 3,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: Colors.primaryDark,
    backgroundColor: Colors.primaryMuted,
    marginBottom: 4,
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 9999,
    backgroundColor: Colors.surfaceDark,
  },
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
    backgroundColor: Colors.primaryMuted,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
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
    borderRadius: 10,
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
    color: Colors.primaryBase,
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
  classLockHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  classLockHintText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  classeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  classeRowAtual: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  classeRowLocked: {
    opacity: 0.45,
  },
  classeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceDark,
  },
  classeAvatarLocked: {
    tintColor: Colors.textMuted,
  },
  classeInfo: {
    flex: 1,
    gap: 2,
  },
  classeName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  classeNameLocked: {
    color: Colors.textMuted,
  },
  classeBonus: {
    color: Colors.primaryBase,
    fontSize: 11,
  },
  classeBonusLocked: {
    color: Colors.textMuted,
  },
  classeAtualBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  classeAtualBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "bold",
  },
  classeLockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surface,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  classeLockText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
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
  conquistaIconEmoji: { fontSize: 24 },
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
