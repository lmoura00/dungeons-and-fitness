import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { CustomInput } from "../../components/CustomInput";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { trpc } from "../../lib/trpc";

export default function GuildScreen() {
  const utils = trpc.useUtils();
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const { data: minhaGuilda, isLoading: loadingMinhaGuilda } = trpc.guildas.minhaGuilda.useQuery();
  const { data: guildas, isLoading: loadingGuildas } = trpc.guildas.listar.useQuery(undefined, {
    enabled: !loadingMinhaGuilda && !minhaGuilda,
  });

  const invalidarGuildas = () => {
    utils.guildas.minhaGuilda.invalidate();
    utils.guildas.listar.invalidate();
  };

  const criarMutation = trpc.guildas.criar.useMutation({
    onSuccess: () => {
      setModalVisible(false);
      setNome("");
      setDescricao("");
      invalidarGuildas();
    },
    onError: (e) => Alert.alert("Erro ao criar guilda", e.message),
  });

  const entrarMutation = trpc.guildas.entrar.useMutation({
    onSuccess: invalidarGuildas,
    onError: (e) => Alert.alert("Erro ao entrar na guilda", e.message),
  });

  const sairMutation = trpc.guildas.sair.useMutation({
    onSuccess: invalidarGuildas,
    onError: (e) => Alert.alert("Erro ao sair da guilda", e.message),
  });

  const handleCriar = () => {
    if (nome.trim().length < 3) {
      Alert.alert("Atenção", "O nome da guilda precisa ter pelo menos 3 caracteres.");
      return;
    }
    criarMutation.mutate({ nome: nome.trim(), descricao: descricao.trim() || undefined });
  };

  const handleSair = () => {
    if (!minhaGuilda) return;
    Alert.alert("Sair da guilda", `Tem certeza que deseja sair de "${minhaGuilda.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => sairMutation.mutate({ guildaId: minhaGuilda.id }) },
    ]);
  };

  const isLoading = loadingMinhaGuilda || (!minhaGuilda && loadingGuildas);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScreenHeader
        title="Guilda"
        subtitle={minhaGuilda ? minhaGuilda.name : "Junte-se a uma guilda ou funde a sua"}
        style={styles.header}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        ) : minhaGuilda ? (
          <View style={styles.guildCard}>
            <View style={styles.guildIconWrap}>
              <Ionicons name="shield-half" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.guildName}>{minhaGuilda.name}</Text>
            {minhaGuilda.description ? (
              <Text style={styles.guildDesc}>{minhaGuilda.description}</Text>
            ) : null}

            <View style={styles.xpCard}>
              <Text style={styles.xpValue}>{minhaGuilda.totalXp} XP</Text>
              <Text style={styles.xpLabel}>Experiência da Guilda</Text>
            </View>

            <Text style={styles.sectionLabel}>Membros ({minhaGuilda.members.length})</Text>
            <View style={styles.membersList}>
              {minhaGuilda.members.map((membro) => (
                <View key={membro.id} style={styles.memberRow}>
                  <Ionicons
                    name={membro.role === "lider" ? "star" : "person-circle-outline"}
                    size={18}
                    color={membro.role === "lider" ? Colors.gold : Colors.textSecondary}
                  />
                  <Text style={styles.memberName} numberOfLines={1}>
                    {membro.character.name}
                  </Text>
                  {membro.role === "lider" && <Text style={styles.leaderTag}>líder</Text>}
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.sairButton}
              onPress={handleSair}
              disabled={sairMutation.isPending}
              activeOpacity={0.8}
            >
              {sairMutation.isPending ? (
                <ActivityIndicator size="small" color={Colors.crimson} />
              ) : (
                <Text style={styles.sairButtonText}>Sair da Guilda</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.criarButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={18} color={Colors.textOnPrimary} />
              <Text style={styles.criarButtonText}>Fundar Guilda</Text>
            </TouchableOpacity>

            {!guildas || guildas.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="shield-outline" size={80} color={Colors.primaryBase} />
                </View>
                <Text style={styles.emptyTitle}>Nenhuma guilda fundada</Text>
                <Text style={styles.emptyDesc}>
                  Seja o primeiro a erguer o estandarte de uma guilda nesse reino.
                </Text>
              </View>
            ) : (
              <View style={styles.guildasList}>
                {guildas.map((guilda) => (
                  <View key={guilda.id} style={styles.guildaListCard}>
                    <View style={styles.guildaListIconWrap}>
                      <Ionicons name="shield-outline" size={22} color={Colors.primary} />
                    </View>
                    <View style={styles.guildaListInfo}>
                      <Text style={styles.guildaListName} numberOfLines={1}>{guilda.name}</Text>
                      {guilda.description ? (
                        <Text style={styles.guildaListDesc} numberOfLines={1}>{guilda.description}</Text>
                      ) : null}
                      <Text style={styles.guildaListXp}>{guilda.totalXp} XP</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.entrarButton}
                      onPress={() => entrarMutation.mutate({ guildaId: guilda.id })}
                      disabled={entrarMutation.isPending}
                      activeOpacity={0.8}
                    >
                      {entrarMutation.isPending && entrarMutation.variables?.guildaId === guilda.id ? (
                        <ActivityIndicator size="small" color={Colors.textOnPrimary} />
                      ) : (
                        <Text style={styles.entrarText}>Entrar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.modalKeyboardView}
            >
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Fundar Guilda</Text>
                <CustomInput
                  icon="shield-outline"
                  placeholder="Nome da guilda"
                  value={nome}
                  onChangeText={setNome}
                  maxLength={100}
                />
                <CustomInput
                  icon="document-text-outline"
                  placeholder="Descrição (opcional)"
                  value={descricao}
                  onChangeText={setDescricao}
                  maxLength={255}
                  multiline
                />
                <PrimaryButton
                  title={criarMutation.isPending ? "Fundando..." : "Fundar"}
                  onPress={handleCriar}
                  disabled={criarMutation.isPending}
                />
                <PrimaryButton
                  title="Cancelar"
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                  disabled={criarMutation.isPending}
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  guildCard: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    alignItems: "center",
  },
  guildIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  guildName: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  guildDesc: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 19,
  },
  xpCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 16,
    width: "100%",
  },
  xpValue: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: "bold",
  },
  xpLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    alignSelf: "flex-start",
    marginTop: 20,
    marginBottom: 8,
  },
  membersList: {
    width: "100%",
    gap: 8,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  memberName: {
    color: Colors.textPrimary,
    fontSize: 14,
    flex: 1,
  },
  leaderTag: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  sairButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.crimson,
    minWidth: 160,
    alignItems: "center",
  },
  sairButtonText: {
    color: Colors.crimson,
    fontSize: 13,
    fontWeight: "bold",
  },
  criarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    marginBottom: 20,
  },
  criarButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 15,
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 14,
  },
  emptyIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
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
    lineHeight: 21,
    paddingHorizontal: 24,
  },
  guildasList: {
    gap: 12,
  },
  guildaListCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  guildaListIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guildaListInfo: {
    flex: 1,
  },
  guildaListName: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "bold",
  },
  guildaListDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  guildaListXp: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  entrarButton: {
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
  entrarText: {
    color: Colors.textOnPrimary,
    fontSize: 12,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalKeyboardView: {
    width: "100%",
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
});
