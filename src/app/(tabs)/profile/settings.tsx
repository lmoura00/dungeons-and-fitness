import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import { CustomInput } from "../../../components/CustomInput";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { ScreenHeader } from "../../../components/ScreenHeader";
import { trpc } from "../../../lib/trpc";
import { obterPushToken } from "../../../lib/notifications";

const PREFERENCIAS_FUTURAS = [
  { key: "tema", label: "Tema", desc: "Claro, escuro ou automático", ionicon: "color-palette-outline" },
  { key: "idioma", label: "Idioma", desc: "Português, inglês e mais", ionicon: "language-outline" },
  { key: "unidade", label: "Unidade de Medida", desc: "Métrico (kg/cm) ou imperial (lb/ft)", ionicon: "swap-horizontal-outline" },
] as const;

export default function ConfiguracoesScreen() {
  const utils = trpc.useUtils();
  const { data: perfil, isLoading } = trpc.usuarios.meuPerfil.useQuery();

  const [notificacoesAtivas, setNotificacoesAtivas] = useState(false);
  const [alterandoNotificacao, setAlterandoNotificacao] = useState(false);
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");

  useEffect(() => {
    if (!perfil) return;
    setNotificacoesAtivas(!!perfil.pushToken);
    setPeso(perfil.weightKg != null ? String(perfil.weightKg) : "");
    setAltura(perfil.heightCm != null ? String(perfil.heightCm) : "");
  }, [perfil]);

  const atualizarPushTokenMutation = trpc.usuarios.atualizarPushToken.useMutation({
    onSuccess: () => utils.usuarios.meuPerfil.invalidate(),
    onError: (e) => Alert.alert("Erro", e.message),
  });

  const editarMutation = trpc.usuarios.editar.useMutation({
    onSuccess: () => {
      utils.usuarios.meuPerfil.invalidate();
      Alert.alert("Pronto!", "Dados físicos atualizados.");
    },
    onError: (e) => Alert.alert("Erro ao salvar", e.message),
  });

  const handleToggleNotificacoes = async (valor: boolean) => {
    setAlterandoNotificacao(true);
    try {
      if (valor) {
        const token = await obterPushToken();
        if (!token) {
          Alert.alert(
            "Permissão necessária",
            Platform.OS === "ios"
              ? "Ative as notificações para o app nas Configurações do sistema."
              : "Ative as notificações para o app nas configurações do dispositivo."
          );
          setNotificacoesAtivas(false);
          return;
        }
        await atualizarPushTokenMutation.mutateAsync({ pushToken: token });
        setNotificacoesAtivas(true);
      } else {
        await atualizarPushTokenMutation.mutateAsync({ pushToken: null });
        setNotificacoesAtivas(false);
      }
    } finally {
      setAlterandoNotificacao(false);
    }
  };

  const handleSalvarDadosFisicos = () => {
    const pesoKg = Number(peso.replace(",", "."));
    const alturaCm = Number(altura.replace(",", "."));
    if (!peso.trim() || !altura.trim() || !Number.isFinite(pesoKg) || !Number.isFinite(alturaCm) || pesoKg <= 0 || alturaCm <= 0) {
      Alert.alert("Atenção", "Informe peso e altura válidos.");
      return;
    }
    editarMutation.mutate({ pesoKg, alturaCm });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScreenHeader title="Configurações" subtitle="Preferências e dados da conta" showBackButton style={styles.header} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notificações */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>NOTIFICAÇÕES</Text>
          <View style={styles.row}>
            <View style={styles.rowIconWrap}>
              <Ionicons name="notifications-outline" size={18} color={Colors.primary} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Notificações push</Text>
              <Text style={styles.rowDesc}>Lembretes de streak, convites de guilda e conquistas</Text>
            </View>
            <Switch
              value={notificacoesAtivas}
              onValueChange={handleToggleNotificacoes}
              disabled={isLoading || alterandoNotificacao}
              trackColor={{ false: Colors.surface, true: Colors.primaryMuted }}
              thumbColor={notificacoesAtivas ? Colors.primary : Colors.textMuted}
              ios_backgroundColor={Colors.surface}
            />
          </View>
        </View>

        {/* Dados físicos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>DADOS FÍSICOS</Text>
          <View style={styles.rowFields}>
            <View style={styles.rowField}>
              <Text style={styles.fieldLabel}>Peso (kg)</Text>
              <CustomInput
                icon="barbell-outline"
                placeholder="Ex: 70"
                value={peso}
                onChangeText={setPeso}
                keyboardType="decimal-pad"
                containerStyle={styles.fieldInput}
              />
            </View>
            <View style={styles.rowField}>
              <Text style={styles.fieldLabel}>Altura (cm)</Text>
              <CustomInput
                icon="resize-outline"
                placeholder="Ex: 175"
                value={altura}
                onChangeText={setAltura}
                keyboardType="decimal-pad"
                containerStyle={styles.fieldInput}
              />
            </View>
          </View>
          <PrimaryButton
            title={editarMutation.isPending ? "Salvando..." : "Salvar"}
            onPress={handleSalvarDadosFisicos}
            disabled={editarMutation.isPending}
            style={styles.saveButton}
          />
        </View>

        {/* Preferências futuras */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PREFERÊNCIAS</Text>
          {PREFERENCIAS_FUTURAS.map((pref) => (
            <TouchableOpacity key={pref.key} style={styles.row} activeOpacity={1} disabled>
              <View style={styles.rowIconWrap}>
                <Ionicons name={pref.ionicon as any} size={18} color={Colors.textMuted} />
              </View>
              <View style={styles.rowInfo}>
                <Text style={[styles.rowLabel, styles.rowLabelLocked]}>{pref.label}</Text>
                <Text style={styles.rowDesc}>{pref.desc}</Text>
              </View>
              <View style={styles.emBreveBadge}>
                <Text style={styles.emBreveBadgeText}>Em breve</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 10,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  cardTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  rowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  rowInfo: {
    flex: 1,
  },
  rowLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  rowLabelLocked: {
    color: Colors.textSecondary,
  },
  rowDesc: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  emBreveBadge: {
    backgroundColor: Colors.surface,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emBreveBadgeText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  rowFields: {
    flexDirection: "row",
    gap: 12,
  },
  rowField: {
    flex: 1,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 3,
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  fieldInput: {
    marginBottom: 0,
  },
  saveButton: {
    marginTop: 2,
    marginBottom: 0,
  },
});
