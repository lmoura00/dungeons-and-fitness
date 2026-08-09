import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { CustomInput } from "../../components/CustomInput";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ProgressBar } from "../../components/ProgressBar";
import { ScreenHeader } from "../../components/ScreenHeader";
import { trpc } from "../../lib/trpc";

type TipoAtividade = "corrida" | "forca" | "ciclismo" | "natacao" | "yoga" | "esporte" | "outro";
type Intensidade = "leve" | "moderado" | "intenso";

const TIPOS: { value: TipoAtividade; label: string; ionicon: string }[] = [
  { value: "corrida",   label: "Corrida",   ionicon: "walk"    },
  { value: "forca",     label: "Força",     ionicon: "barbell" },
  { value: "ciclismo",  label: "Ciclismo",  ionicon: "bicycle" },
  { value: "natacao",   label: "Natação",   ionicon: "water"   },
  { value: "yoga",      label: "Yoga",      ionicon: "leaf"    },
  { value: "esporte",   label: "Esporte",   ionicon: "football"},
  { value: "outro",     label: "Outro",     ionicon: "fitness" },
];

const INTENSIDADES: { value: Intensidade; label: string }[] = [
  { value: "leve",     label: "Leve"     },
  { value: "moderado", label: "Moderado" },
  { value: "intenso",  label: "Intenso"  },
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <ScreenHeader
              title="Registrar Atividade"
              subtitle="Registre seu treino e ganhe XP"
              showBackButton
              style={styles.header}
            />

            <View style={styles.formCard}>
              <Text style={styles.label}>Tipo de Atividade</Text>
              <View style={styles.tiposGrid}>
                {TIPOS.map((tipo) => {
                  const ativo = tipoAtividade === tipo.value;
                  return (
                    <TouchableOpacity
                      key={tipo.value}
                      style={[styles.tipoButton, ativo && styles.tipoButtonAtivo]}
                      onPress={() => setTipoAtividade(tipo.value)}
                    >
                      <Ionicons
                        name={tipo.ionicon as any}
                        size={16}
                        color={ativo ? Colors.textOnPrimary : Colors.textMuted}
                      />
                      <Text style={[styles.tipoLabel, ativo && styles.tipoLabelAtivo]}>
                        {tipo.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
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
                {INTENSIDADES.map((item) => {
                  const ativo = intensidade === item.value;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      style={[styles.intensidadeButton, ativo && styles.intensidadeButtonAtivo]}
                      onPress={() => setIntensidade(item.value)}
                    >
                      <Text style={[styles.intensidadeText, ativo && styles.intensidadeTextAtivo]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.infoBox}>
                <Ionicons
                  name="bulb"
                  size={20}
                  color={Colors.primaryBase}
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
              <Ionicons name="trophy" size={50} color={Colors.gold} />
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
    paddingTop: 24,
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 0,
    paddingTop: 0,
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 10,
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tipoButtonAtivo: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  tipoLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  tipoLabelAtivo: {
    color: Colors.textOnPrimary,
  },
  intensidadeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  intensidadeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
  },
  intensidadeButtonAtivo: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  intensidadeText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "bold",
  },
  intensidadeTextAtivo: {
    color: Colors.textOnPrimary,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: Colors.primaryMuted,
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    color: Colors.textSecondary,
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
    backgroundColor: Colors.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primaryBase,
    marginBottom: 24,
    shadowColor: Colors.primaryBase,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
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
    borderRadius: 10,
    paddingVertical: 24,
    paddingHorizontal: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primaryDark,
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
    borderRadius: 10,
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
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },
  rewardProgressText: {
    color: Colors.primaryBase,
    fontSize: 14,
    fontWeight: "bold",
  },
  rewardFooter: {
    width: "100%",
    marginTop: "auto",
  },
});
