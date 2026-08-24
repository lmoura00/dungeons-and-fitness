import React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import { ScreenHeader } from "../../../components/ScreenHeader";
import { trpc } from "../../../lib/trpc";

export default function SolicitacoesGuildaScreen() {
  const utils = trpc.useUtils();
  const { data: solicitacoes, isLoading } = trpc.guildas.listarSolicitacoes.useQuery();

  const responderMutation = trpc.guildas.responderSolicitacao.useMutation({
    onSuccess: (_data, variables) => {
      utils.guildas.listarSolicitacoes.invalidate();
      if (variables.aceitar) {
        utils.guildas.minhaGuilda.invalidate();
        utils.guildas.listar.invalidate();
      }
    },
    onError: (e) => Alert.alert("Erro", e.message),
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScreenHeader title="Solicitações" subtitle="Pedidos para entrar na sua guilda" showBackButton style={styles.header} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        ) : !solicitacoes || solicitacoes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="person-add-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Nenhum pedido pendente</Text>
            <Text style={styles.emptyDesc}>Quando alguém pedir para entrar na sua guilda, o pedido aparece aqui.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {solicitacoes.map((solicitacao) => (
              <View key={solicitacao.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.crestSmall}>
                    <Ionicons name="person" size={20} color={Colors.textSecondary} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.characterName} numberOfLines={1}>{solicitacao.character.name}</Text>
                    <Text style={styles.subtitle} numberOfLines={1}>Quer entrar na sua guilda</Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacityButton
                    label="Recusar"
                    variant="outline"
                    disabled={responderMutation.isPending}
                    loading={responderMutation.isPending && responderMutation.variables?.solicitacaoId === solicitacao.id && responderMutation.variables?.aceitar === false}
                    onPress={() => responderMutation.mutate({ solicitacaoId: solicitacao.id, aceitar: false })}
                  />
                  <TouchableOpacityButton
                    label="Aceitar"
                    variant="primary"
                    disabled={responderMutation.isPending}
                    loading={responderMutation.isPending && responderMutation.variables?.solicitacaoId === solicitacao.id && responderMutation.variables?.aceitar === true}
                    onPress={() => responderMutation.mutate({ solicitacaoId: solicitacao.id, aceitar: true })}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TouchableOpacityButton({
  label,
  variant,
  disabled,
  loading,
  onPress,
}: {
  label: string;
  variant: "primary" | "outline";
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, variant === "primary" ? styles.actionButtonPrimary : styles.actionButtonOutline]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "primary" ? Colors.textOnPrimary : Colors.textSecondary} />
      ) : (
        <Text style={variant === "primary" ? styles.actionButtonPrimaryText : styles.actionButtonOutlineText}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
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
    gap: 12,
  },
  card: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  crestSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
  },
  characterName: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "bold",
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 38,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  actionButtonOutline: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonPrimaryText: {
    color: Colors.textOnPrimary,
    fontSize: 13,
    fontWeight: "bold",
  },
  actionButtonOutlineText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
});
