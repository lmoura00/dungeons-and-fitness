import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Modal, 
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { CustomInput } from "../../components/CustomInput";
import { PrimaryButton } from "../../components/PrimaryButton";


const RACE_IMAGES: Record<string, any> = {
  human: require("../../../assets/race-human.png"),
  dwarf: require("../../../assets/race-dwarf.png"),
  elf: require("../../../assets/race-elf.png"),
};

export default function NameScreen() {
  const params = useLocalSearchParams<{ raceId: string; raceName: string }>();
  const raceId = params.raceId || "dwarf";
  const raceName = params.raceName || "Anão";

  const [characterName, setCharacterName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [avatarSeed, setAvatarSeed] = useState<string | null>(null);

  
  const [isHelpVisible, setHelpVisible] = useState(false);

  const handleGenerateAvatar = () => {
    const baseName = characterName.trim() || "Hero";
    const randomSuffix = Math.floor(Math.random() * 1000);
    setAvatarSeed(`${baseName}-${randomSuffix}`);
  };

  const handleNext = () => {
    if (characterName.trim() === "") {
      setErrorMessage("Por favor, dê um nome ao seu aventureiro.");
      return;
    }

    router.push({
      pathname: "/(onboarding)/confirmation",
      params: { raceId, raceName, characterName, avatarSeed: avatarSeed || "" },
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
          <Text style={styles.subtitle}>
            Escolha um nome épico para sua jornada
          </Text>

          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Image
                source={
                  avatarSeed
                    ? {
                        uri: `https://api.dicebear.com/8.x/adventurer/png?seed=${avatarSeed}&backgroundColor=F5A623`,
                      }
                    : RACE_IMAGES[raceId]
                }
                style={styles.avatarImage}
              />
            </View>

           
            <View style={styles.avatarButtonRow}>
              <TouchableOpacity
                style={styles.avatarButton}
                onPress={handleGenerateAvatar}
              >
                <Text style={styles.avatarButtonText}>Trocar Avatar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.helpButton}
                onPress={() => setHelpVisible(true)}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={24}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

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
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Raça</Text>
              <Text style={styles.summaryValue}>{raceName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Classe Inicial</Text>
              <Text
                style={[styles.summaryValue, { color: Colors.textSecondary }]}
              >
                🔒 Aprendiz
              </Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle"
              size={20}
              color={Colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.infoText}>
              Você começará como Aprendiz. Ao atingir o nível 5, poderá escolher
              sua classe final.
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

     
      <Modal
        animationType="fade"
        transparent={true}
        visible={isHelpVisible}
        onRequestClose={() => setHelpVisible(false)} 
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Text style={styles.modalIcon}>🔮</Text>
            </View>
            <Text style={styles.modalTitle}>Magia dos Avatares</Text>
            <Text style={styles.modalText}>
              Nossos avatares são gerados magicamente através de um portal
              distante! Cada clique em "Trocar Avatar" cria uma combinação única
              e exclusiva para o seu aventureiro.
            </Text>
            <PrimaryButton
              title="ENTENDI"
              onPress={() => setHelpVisible(false)}
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, flexGrow: 1 },
  header: { flexDirection: "row", marginBottom: 16 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepText: {
    color: Colors.textSecondary,
    fontSize: 12,
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "700",
  },
  title: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
  },

  avatarSection: { alignItems: "center", marginBottom: 32 },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surfaceDark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 16,
    overflow: "hidden",
  },
  avatarImage: { width: 100, height: 100 },

  avatarButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 12,
  },
  avatarButtonText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  helpButton: { padding: 4 },

  inputSection: { marginBottom: 24 },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: "500",
  },
  summaryCard: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  summaryLabel: { color: Colors.textSecondary, fontSize: 14 },
  summaryValue: { color: Colors.primary, fontSize: 14, fontWeight: "bold" },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(245, 166, 35, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(245, 166, 35, 0.3)",
  },
  infoText: { color: Colors.primary, fontSize: 12, flex: 1, lineHeight: 18 },
  footer: { marginTop: "auto" },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  dotActive: { backgroundColor: Colors.primary, width: 24 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: Colors.surfaceDark,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 28,
  },
  modalTitle: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
});
