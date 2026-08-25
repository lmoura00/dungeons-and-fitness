import React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { ScreenHeader } from "../../components/ScreenHeader";
import { trpc } from "../../lib/trpc";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const ICONE_POR_TIPO: Record<string, IoniconName> = {
  missao_nova: "shield",
  conquista_desbloqueada: "trophy",
  convite_guilda: "people",
  convite_guilda_resposta: "people",
  solicitacao_guilda: "person-add",
  solicitacao_guilda_resposta: "person-add",
  streak_risco: "flame",
};

function formatarQuando(data: string | Date): string {
  const d = new Date(data);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffDias = Math.floor(diffH / 24);
  return `há ${diffDias}d`;
}

export default function NotificationsScreen() {
  const utils = trpc.useUtils();
  const { data: notificacoes, isLoading } = trpc.notificacoes.listar.useQuery();

  const marcarLidaMutation = trpc.notificacoes.marcarLida.useMutation({
    onSuccess: () => {
      utils.notificacoes.listar.invalidate();
      utils.notificacoes.naoLidas.invalidate();
    },
  });

  const marcarTodasLidasMutation = trpc.notificacoes.marcarTodasLidas.useMutation({
    onSuccess: () => {
      utils.notificacoes.listar.invalidate();
      utils.notificacoes.naoLidas.invalidate();
    },
  });

  const temNaoLidas = notificacoes?.some((n) => !n.read) ?? false;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScreenHeader
        title="Notificações"
        subtitle="Missões, conquistas e guilda"
        showBackButton
        style={styles.header}
        rightSlot={
          temNaoLidas ? (
            <TouchableOpacity
              onPress={() => marcarTodasLidasMutation.mutate()}
              disabled={marcarTodasLidasMutation.isPending}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.marcarTodasText}>Marcar todas</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        ) : !notificacoes || notificacoes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
            <Text style={styles.emptyDesc}>Missões novas, conquistas e novidades da guilda aparecem aqui.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {notificacoes.map((notificacao) => (
              <TouchableOpacity
                key={notificacao.id}
                style={[styles.card, !notificacao.read && styles.cardNaoLida]}
                activeOpacity={0.8}
                onPress={() => {
                  if (!notificacao.read) marcarLidaMutation.mutate({ id: notificacao.id });
                }}
              >
                <View style={[styles.iconWrap, !notificacao.read && styles.iconWrapNaoLida]}>
                  <Ionicons
                    name={ICONE_POR_TIPO[notificacao.type] ?? "notifications"}
                    size={18}
                    color={!notificacao.read ? Colors.primary : Colors.textMuted}
                  />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{notificacao.title}</Text>
                  {notificacao.body ? (
                    <Text style={styles.cardBody} numberOfLines={3}>{notificacao.body}</Text>
                  ) : null}
                  <Text style={styles.cardQuando}>{formatarQuando(notificacao.createdAt)}</Text>
                </View>
                {!notificacao.read && <View style={styles.dot} />}
              </TouchableOpacity>
            ))}
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  marcarTodasText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 14,
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
    lineHeight: 21,
    paddingHorizontal: 24,
  },
  list: {
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  cardNaoLida: {
    borderColor: "rgba(255, 178, 63, 0.4)",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapNaoLida: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primaryDark,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  cardBody: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  cardQuando: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
});
