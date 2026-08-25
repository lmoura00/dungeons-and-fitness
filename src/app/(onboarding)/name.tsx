import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { CustomInput } from "../../components/CustomInput";
import { PrimaryButton } from "../../components/PrimaryButton";
import { trpc } from "../../lib/trpc";
import { getAvatarByKey, getAvatarsByRace } from "../../utils/getAvatar";

const CLASS_LABELS: Record<string, string> = {
  APRENDIZ: "Aprendiz", GUERREIRO: "Guerreiro",
  MAGO: "Mago", MONGE: "Monge", PATRULHEIRO: "Patrulheiro",
};

export default function NameScreen() {
  const params = useLocalSearchParams<{ raceId: string; raceName: string }>();
  const raceId   = params.raceId   || "dwarf";
  const raceName = params.raceName || "Anão";

  const [characterName, setCharacterName] = useState("");
  const [errorMessage, setErrorMessage]   = useState("");
  const [selectedKey, setSelectedKey]     = useState<string | null>(null);

  const { data: usuario } = trpc.usuarios.meuPerfil.useQuery();
  // Only Aprendiz avatars during onboarding — class is locked until level 5
  const avatarList = useMemo(
    () => getAvatarsByRace(raceName).filter(({ key }) => key.includes("_APRENDIZ_")),
    [raceName],
  );

  // Set initial selection based on user gender once loaded
  useEffect(() => {
    if (!usuario || selectedKey) return;
    const g   = usuario.gender?.startsWith("f") ? "F" : "M";
    const rNorm = raceName
      .normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().trim();
    const target = `${rNorm}_APRENDIZ_${g}`;
    const found  = avatarList.find((a) => a.key === target);
    setSelectedKey(found ? found.key : avatarList[0]?.key ?? null);
  }, [usuario]);

  const currentSource = getAvatarByKey(selectedKey ?? avatarList[0]?.key);

  const handleNext = () => {
    if (characterName.trim() === "") {
      setErrorMessage("Por favor, dê um nome ao seu aventureiro.");
      return;
    }
    router.push({
      pathname: "/(onboarding)/confirmation",
      params: { raceId, raceName, characterName, avatarKey: selectedKey ?? "" },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.canGoBack() ? router.back() : router.replace("/(onboarding)/choose-race")}
            >
              <Ionicons name="arrow-back" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.stepText}>PASSO 2 DE 3</Text>
          <Text style={styles.title}>Crie seu Personagem</Text>
          <Text style={styles.subtitle}>Escolha um nome épico para sua jornada</Text>

          {/* Avatar grande + picker */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Image source={currentSource} style={styles.avatarImage} resizeMode="contain" />
            </View>

            <Text style={styles.pickerLabel}>Escolher visual</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbStrip}
            >
              {avatarList.map(({ key, source }) => {
                const parts     = key.split("_");
                const classeKey = parts[1] ?? "";
                const genero    = parts[2] ?? "";
                const active    = selectedKey === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.thumbWrap, active && styles.thumbWrapActive]}
                    onPress={() => setSelectedKey(key)}
                    activeOpacity={0.75}
                  >
                    <Image source={source} style={styles.thumbImage} resizeMode="contain" />
                    <Text style={[styles.thumbLabel, active && styles.thumbLabelActive]}>
                      {genero === "F" ? "Feminino" : "Masculino"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Nome */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Nome do Personagem</Text>
            <CustomInput
              placeholder="Digite seu nome..."
              value={characterName}
              onChangeText={(text) => {
                setCharacterName(text);
                if (errorMessage) setErrorMessage("");
              }}
            />
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          </View>

          {/* Resumo */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Raça</Text>
              <Text style={styles.summaryValue}>{raceName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Classe Inicial</Text>
              <View style={styles.lockedValue}>
                <Ionicons name="lock-closed" size={13} color={Colors.textMuted} />
                <Text style={[styles.summaryValue, { color: Colors.textSecondary }]}>Aprendiz</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={Colors.primaryBase} style={{ marginRight: 8 }} />
            <Text style={styles.infoText}>
              Você começará como Aprendiz. Ao atingir o nível 5, poderá escolher sua classe final.
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.pagination}>
              <View style={styles.dot} />
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
            </View>
            <PrimaryButton title="PRÓXIMO" onPress={handleNext} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { padding: 24, flexGrow: 1 },
  header:    { flexDirection: "row", marginBottom: 16 },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: Colors.border,
  },
  stepText: {
    color: Colors.textSecondary, fontSize: 12, letterSpacing: 1,
    textAlign: "center", marginBottom: 8, fontWeight: "700",
  },
  title: {
    color: Colors.primary, fontSize: 28, fontWeight: "bold",
    textAlign: "center", marginBottom: 8,
    textShadowColor: "rgba(232, 148, 34, 0.3)",
    textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },
  subtitle: {
    color: Colors.textSecondary, fontSize: 14,
    textAlign: "center", marginBottom: 28,
  },
  avatarSection: { alignItems: "center", marginBottom: 28 },
  avatarCircle: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.surfaceDark,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: Colors.primaryBase,
    overflow: "hidden", marginBottom: 16,
  },
  avatarImage: { width: 160, height: 160 },
  pickerLabel: {
    color: Colors.textMuted, fontSize: 11, fontWeight: "700",
    letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10,
  },
  thumbStrip: { paddingHorizontal: 4, gap: 8 },
  thumbWrap: {
    alignItems: "center", gap: 4,
    width: 58,
    paddingVertical: 6, paddingHorizontal: 3,
    borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  thumbWrapActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  thumbImage: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surfaceDark,
  },
  thumbLabel: {
    color: Colors.textMuted, fontSize: 9, fontWeight: "600",
    textAlign: "center",
  },
  thumbLabelActive: { color: Colors.primary },
  thumbGender: {
    color: Colors.textMuted, fontSize: 10,
  },
  thumbGenderActive: { color: Colors.primaryBase },
  inputSection: { marginBottom: 24 },
  label: { color: Colors.textSecondary, fontSize: 12, marginBottom: 8, marginLeft: 4 },
  errorText: {
    color: Colors.crimson, fontSize: 12,
    marginTop: -8, marginBottom: 8, marginLeft: 4, fontWeight: "500",
  },
  summaryCard: {
    backgroundColor: Colors.surfaceDark, borderRadius: 8,
    padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 8,
  },
  summaryLabel: { color: Colors.textSecondary, fontSize: 14 },
  summaryValue: { color: Colors.primary, fontSize: 14, fontWeight: "bold" },
  lockedValue:  { flexDirection: "row", alignItems: "center", gap: 4 },
  infoBox: {
    flexDirection: "row", backgroundColor: Colors.primaryMuted,
    padding: 16, borderRadius: 8, marginBottom: 32,
    alignItems: "center", borderWidth: 1, borderColor: Colors.border,
  },
  infoText: { color: Colors.textSecondary, fontSize: 12, flex: 1, lineHeight: 18 },
  footer: { marginTop: "auto" },
  pagination: { flexDirection: "row", justifyContent: "center", marginBottom: 16 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.border, marginHorizontal: 4,
  },
  dotActive: { backgroundColor: Colors.primary, width: 24 },
});
