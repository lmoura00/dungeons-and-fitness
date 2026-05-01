import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { PrimaryButton } from "../../components/PrimaryButton";

const RACE_IMAGES: Record<string, any> = {
  human: require("../../../assets/race-human.png"),
  dwarf: require("../../../assets/race-dwarf.png"),
  elf: require("../../../assets/race-elf.png"),
};

export default function ConfirmationScreen() {
  const params = useLocalSearchParams<{
    raceId: string;
    raceName: string;
    characterName: string;
    avatarSeed?: string;
  }>();
  const raceId = params.raceId || "dwarf";
  const raceName = params.raceName || "Anão";
  const characterName = params.characterName || "Aventureiro";
  const avatarSeed = params.avatarSeed;

  const handleFinish = () => {
    router.replace("/(tabs)/dashboard");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.stepText}>PASSO 3 DE 3</Text>
        <Text style={styles.title}>Seu Aventureiro</Text>
        <Text style={styles.subtitle}>
          Confirme as informações do seu personagem
        </Text>

        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarGlow}>
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
            </View>
            <Text style={styles.characterName}>{characterName}</Text>
            <Text style={styles.characterSubtitle}>{raceName} • Aprendiz</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Raça</Text>
              <Text style={styles.statValue}>{raceName}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Classe</Text>
              <Text style={[styles.statValue, { color: Colors.textSecondary }]}>
                🔒 Aprendiz
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Nível Inicial</Text>
              <Text style={styles.statValue}>1</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>XP Inicial</Text>
              <Text style={styles.statValue}>0 / 1.000 XP</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>
          <PrimaryButton title="INICIAR AVENTURA" onPress={handleFinish} />
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
  content: {
    padding: 24,
    flexGrow: 1,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
  },
  header: {
    flexDirection: "row",
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceDark,
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
    marginBottom: 4,
    textShadowColor: "rgba(245, 166, 35, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
  },
  card: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarGlow: {
    padding: 4,
    borderRadius: 60,
    backgroundColor: "rgba(245, 166, 35, 0.2)",
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
    overflow: "hidden",
  },
  avatarImage: {
    width: 90,
    height: 90,
  },
  characterName: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 4,
  },
  characterSubtitle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 24,
  },
  statsContainer: {
    width: "100%",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: {
    marginTop: "auto",
    paddingTop: 32,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
});