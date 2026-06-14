import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { CustomInput } from "../../components/CustomInput";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ProgressBar } from "../../components/ProgressBar";
import { trpc } from "../../lib/trpc";

type TipoAtividade = "corrida" | "forca" | "ciclismo" | "natacao" | "yoga" | "esporte" | "outro";
type Intensidade = "leve" | "moderado" | "intenso";

const TIPOS: { value: TipoAtividade; label: string; icon: string }[] = [
  { value: "corrida", label: "Corrida", icon: "🏃" },
  { value: "forca", label: "Força", icon: "💪" },
  { value: "ciclismo", label: "Ciclismo", icon: "🚴" },
  { value: "natacao", label: "Natação", icon: "🏊" },
  { value: "yoga", label: "Yoga", icon: "🧘" },
  { value: "esporte", label: "Esporte", icon: "⚽" },
  { value: "outro", label: "Outro", icon: "🏋️" },
];

const INTENSIDADES: { value: Intensidade; label: string; cor: string }[] = [
  { value: "leve", label: "Leve", cor: "#4CAF50" },
  { value: "moderado", label: "Moderado", cor: Colors.primary },
  { value: "intenso", label: "Intenso", cor: "#F44336" },
];

const XP_POR_NIVEL = 3000;

export default function LogActivityScreen() {
  const utils = trpc.useUtils();

  const [tipoAtividade, setTipoAtividade] = useState<TipoAtividade | null>(null);
  const [minutes, setMinutes] = useState("");
  const [intensidade, setIntensidade] = useState<Intensidade | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [resultado, setResultado] = useState<{ xpGanho: number; xpDepois: number; nivelDepois: number } | null>(null);

  const registrarMutation = trpc.atividades.registrar.useMutation({
    onSuccess: (data) => {
      setResultado({
        xpGanho: data.xp.xpGanho,
        xpDepois: data.xp.xpDepois,
        nivelDepois: data.xp.nivelDepois,
      });
      utils.personagens.meuPersonagem.invalidate();
      utils.streak.atual.invalidate();
      setShowReward(true);
    },
    onError: (e) => Alert.alert("Erro ao registrar", e.message),
  });

  const handleLogActivity = () => {
    if (!tipoAtividade || !minutes.trim() || !intensidade) {
      Alert.alert("Atenção", "Selecione o tipo de atividade, duração e intensidade.");
      return;
    }
    const duracaoMinutos = parseInt(minutes, 10);
    if (isNaN(duracaoMinutos) || duracaoMinutos <= 0) {
      Alert.alert("Atenção", "Informe uma duração válida em minutos.");
      return;
    }
    registrarMutation.mutate({ tipoAtividade, duracaoMinutos, intensidade });
  };

  const handleFinishReward = () => {
    setShowReward(false);
    setTipoAtividade(null);
    setMinutes("");
    setIntensidade(null);
    setResultado(null);
    router.replace("/(tabs)/dashboard");
  };

  const tipoSelecionado = TIPOS.find((t) => t.value === tipoAtividade);
  const xpNoNivel = resultado ? resultado.xpDepois % XP_POR_NIVEL : 0;
  const progresso = xpNoNivel / XP_POR_NIVEL;
  const podeSalvar = !!tipoAtividade && !!minutes.trim() && !!intensidade;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/dashboard")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="arrow-back" size={22} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Registrar Atividade</Text>
              <Text style={styles.headerSub}>Registre seu treino e ganhe XP</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.label}>Tipo de Atividade</Text>
              <View style={styles.tiposGrid}>
                {TIPOS.map((tipo) => (
                  <TouchableOpacity
                    key={tipo.value}
                    style={[
                      styles.tipoButton,
                      tipoAtividade === tipo.value && styles.tipoButtonAtivo,
                    ]}
                    onPress={() => setTipoAtividade(tipo.value)}
                  >
                    <Text style={styles.tipoIcon}>{tipo.icon}</Text>
                    <Text
                      style={[
                        styles.tipoLabel,
                        tipoAtividade === tipo.value && styles.tipoLabelAtivo,
                      ]}
                    >
                      {tipo.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Duração (minutos)</Text>
              <CustomInput
                placeholder="Ex: 30"
                value={minutes}
                onChangeText={setMinutes}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Intensidade</Text>
              <View style={styles.intensidadeRow}>
                {INTENSIDADES.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.intensidadeButton,
                      intensidade === item.value && {
                        borderColor: item.cor,
                        backgroundColor: `${item.cor}20`,
                      },
                    ]}
                    onPress={() => setIntensidade(item.value)}
                  >
                    <Text
                      style={[
                        styles.intensidadeText,
                        intensidade === item.value && { color: item.cor },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.infoBox}>
                <Ionicons
                  name="bulb"
                  size={20}
                  color={Colors.primary}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>
                  Dica: Você ganhará XP baseado na duração e intensidade. Quanto mais
                  desafiador, mais XP!
                </Text>
              </View>

              <PrimaryButton
                title={registrarMutation.isPending ? "REGISTRANDO..." : "REGISTRAR E GANHAR XP"}
                onPress={handleLogActivity}
                disabled={!podeSalvar || registrarMutation.isPending}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Modal visible={showReward} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.rewardContent}>
            <View style={styles.glowCircle}>
              <Text style={styles.trophyIcon}>🏆</Text>
            </View>

            <Text style={styles.rewardTitle}>Missão Concluída!</Text>
            <Text style={styles.rewardSubtitle}>
              {tipoSelecionado?.label ?? "Atividade"} • {minutes} min
            </Text>

            <View style={styles.xpCard}>
              <Text style={styles.xpValue}>+{resultado?.xpGanho ?? 0} XP</Text>
              <Text style={styles.xpLabel}>Experiência Adquirida</Text>
            </View>

            <View style={styles.rewardProgressSection}>
              <View style={styles.rewardProgressHeader}>
                <Text style={styles.rewardLevelText}>
                  Nível {resultado?.nivelDepois ?? 1}
                </Text>
                <Text style={styles.rewardProgressText}>
                  {(resultado?.xpDepois ?? 0 % XP_POR_NIVEL).toLocaleString("pt-BR")} /{" "}
                  {XP_POR_NIVEL.toLocaleString("pt-BR")} XP
                </Text>
              </View>
              <ProgressBar progress={progresso} />
            </View>

            <View style={styles.rewardFooter}>
              <PrimaryButton title="CONTINUAR JORNADA" onPress={handleFinishReward} />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: Platform.OS === "ios" ? 10 : 50,
    flexGrow: 1,
  },
  topBar: {
    marginBottom: 16,
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
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    marginLeft: 4,
  },
  tiposGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  tipoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tipoButtonAtivo: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(245, 166, 35, 0.15)",
  },
  tipoIcon: {
    fontSize: 16,
  },
  tipoLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  tipoLabelAtivo: {
    color: Colors.primary,
  },
  intensidadeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  intensidadeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  intensidadeText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "bold",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(245, 166, 35, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(245, 166, 35, 0.3)",
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    color: Colors.primary,
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  rewardContent: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  glowCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(245, 166, 35, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  trophyIcon: {
    fontSize: 50,
  },
  rewardTitle: {
    color: Colors.primary,
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  rewardSubtitle: {
    color: Colors.textSecondary,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 40,
  },
  xpCard: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 40,
    width: "100%",
  },
  xpValue: {
    color: Colors.primary,
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 8,
  },
  xpLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  rewardProgressSection: {
    width: "100%",
    backgroundColor: Colors.surfaceDark,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 40,
  },
  rewardProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  rewardLevelText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  rewardProgressText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
  rewardFooter: {
    width: "100%",
    marginTop: "auto",
  },
});
