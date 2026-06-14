import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { trpc } from "../../lib/trpc";

const DIFICULDADE_COR: Record<string, string> = {
  facil: "#4CAF50",
  moderado: Colors.primary,
  dificil: "#F44336",
};

const CATEGORIA_ICON: Record<string, string> = {
  cardio: "🏃",
  forca: "💪",
  mental: "🧘",
  full_body: "⚡",
  flexibilidade: "🤸",
};

export default function QuestsScreen() {
  const utils = trpc.useUtils();
  const { data: missoes, isLoading } = trpc.missoesUsuario.hoje.useQuery();

  const gerarMutation = trpc.missoesUsuario.gerarHoje.useMutation({
    onSuccess: () => utils.missoesUsuario.hoje.invalidate(),
    onError: (e) => Alert.alert("Erro", e.message),
  });

  const concluirMutation = trpc.missoesUsuario.concluir.useMutation({
    onSuccess: () => {
      utils.missoesUsuario.hoje.invalidate();
      utils.personagens.meuPersonagem.invalidate();
      utils.streak.atual.invalidate();
    },
    onError: (e) => Alert.alert("Erro", e.message),
  });

  const concluidas = missoes?.filter((m) => m.status === "concluida").length ?? 0;
  const total = missoes?.length ?? 0;

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
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Missões</Text>
          <Text style={styles.headerSub}>
            {total > 0 ? `${concluidas} de ${total} concluídas hoje` : "Sem missões geradas"}
          </Text>
        </View>
        {total > 0 && (
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>{Math.round((concluidas / total) * 100)}%</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        ) : !missoes || missoes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📜</Text>
            <Text style={styles.emptyTitle}>Sem missões hoje</Text>
            <Text style={styles.emptyDesc}>
              Gere suas missões diárias para começar a aventura!
            </Text>
            <TouchableOpacity
              style={styles.gerarButton}
              onPress={() => gerarMutation.mutate()}
              disabled={gerarMutation.isPending}
              activeOpacity={0.8}
            >
              {gerarMutation.isPending ? (
                <ActivityIndicator size="small" color={Colors.background} />
              ) : (
                <>
                  <Ionicons name="refresh" size={18} color={Colors.background} />
                  <Text style={styles.gerarButtonText}>Gerar Missões</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.questsList}>
            {missoes.map((missaoUsuario) => {
              const concluida = missaoUsuario.status === "concluida";
              const processando =
                concluirMutation.isPending &&
                concluirMutation.variables?.missaoUsuarioId === missaoUsuario.id;
              const dificuldade = missaoUsuario.mission.difficulty;
              const categoria = missaoUsuario.mission.category;
              const cor = DIFICULDADE_COR[dificuldade] ?? Colors.primary;

              return (
                <View
                  key={missaoUsuario.id}
                  style={[styles.questCard, concluida && styles.questCardConcluida]}
                >
                  <View style={[styles.questAccent, { backgroundColor: concluida ? Colors.border : cor }]} />

                  <View style={styles.questBody}>
                    <View style={styles.questTop}>
                      <View style={styles.questIconWrap}>
                        <Text style={styles.questEmoji}>
                          {concluida ? "✅" : (CATEGORIA_ICON[categoria] ?? "⚔️")}
                        </Text>
                      </View>
                      <View style={styles.questInfo}>
                        <Text style={[styles.questTitle, concluida && styles.textDone]} numberOfLines={1}>
                          {missaoUsuario.mission.title}
                        </Text>
                        {missaoUsuario.mission.description ? (
                          <Text style={styles.questDesc} numberOfLines={2}>
                            {missaoUsuario.mission.description}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.questBottom}>
                      <View style={styles.tagsRow}>
                        <View style={[styles.tag, { borderColor: cor }]}>
                          <Text style={[styles.tagText, { color: cor }]}>{dificuldade}</Text>
                        </View>
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>{categoria}</Text>
                        </View>
                      </View>

                      <View style={styles.questActions}>
                        <Text style={[styles.xpReward, concluida && styles.xpRewardDone]}>
                          +{missaoUsuario.mission.xpReward} XP
                        </Text>
                        {!concluida && (
                          <TouchableOpacity
                            style={styles.concluirButton}
                            onPress={() => concluirMutation.mutate({ missaoUsuarioId: missaoUsuario.id })}
                            disabled={concluirMutation.isPending}
                            activeOpacity={0.8}
                          >
                            {processando ? (
                              <ActivityIndicator size="small" color={Colors.background} />
                            ) : (
                              <Text style={styles.concluirText}>Concluir</Text>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
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
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(245, 166, 35, 0.12)",
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  progressText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "bold",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
  },
  emptyDesc: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  gerarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    marginTop: 8,
    minWidth: 160,
    justifyContent: "center",
  },
  gerarButtonText: {
    color: Colors.background,
    fontSize: 15,
    fontWeight: "bold",
  },
  questsList: {
    gap: 12,
  },
  questCard: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceDark,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  questCardConcluida: {
    opacity: 0.55,
  },
  questAccent: {
    width: 4,
    borderRadius: 2,
    margin: 12,
    marginRight: 0,
  },
  questBody: {
    flex: 1,
    padding: 14,
    gap: 10,
  },
  questTop: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  questIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questEmoji: { fontSize: 20 },
  questInfo: { flex: 1 },
  questTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 3,
  },
  textDone: {
    textDecorationLine: "line-through",
    color: Colors.textMuted,
  },
  questDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  questBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagsRow: {
    flexDirection: "row",
    gap: 6,
  },
  tag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  questActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  xpReward: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
  xpRewardDone: {
    color: Colors.textMuted,
  },
  concluirButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
    minWidth: 76,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
  },
  concluirText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: "bold",
  },
});
