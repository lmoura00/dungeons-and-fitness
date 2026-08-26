import React from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { PrimaryButton } from "./PrimaryButton";

const XP_POR_NIVEL = 3000;
const GOLD_SOFT_BORDER = "rgba(212, 168, 75, 0.35)";
const GOLD_TINT_BG = "rgba(212, 168, 75, 0.10)";
const GOLD_TINT_BORDER = "rgba(212, 168, 75, 0.30)";
const GOLD_DIVIDER = "rgba(212, 168, 75, 0.15)";

interface RewardModalProps {
  visible: boolean;
  subtitle: string;
  xpGanho: number;
  xpDepois: number;
  nivelDepois: number;
  onContinue: () => void;
}

export function RewardModal({ visible, subtitle, xpGanho, xpDepois, nivelDepois, onContinue }: RewardModalProps) {
  const xpNoNivel = xpDepois % XP_POR_NIVEL;
  const progresso = Math.min(Math.max(xpNoNivel / XP_POR_NIVEL, 0), 1);

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.topGroup}>
            <View style={styles.badgeWrap}>
              <View style={styles.badgeGlow} />
              <View style={styles.badgeCircle}>
                <Ionicons name="trophy" size={36} color={Colors.gold} />
              </View>
            </View>

            <Text style={styles.title}>Missão Concluída!</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.doneChip}>
              <Ionicons name="checkmark-circle" size={12} color={Colors.gold} />
              <Text style={styles.doneChipText}>CONCLUÍDO</Text>
            </View>

            <Text style={styles.xpValue}>+{xpGanho} XP</Text>
            <Text style={styles.xpLabel}>Experiência Adquirida</Text>

            <View style={styles.divider} />

            <View style={styles.progressHeader}>
              <Text style={styles.levelText}>Nível {nivelDepois}</Text>
              <Text style={styles.progressText}>
                {xpNoNivel.toLocaleString("pt-BR")} / {XP_POR_NIVEL.toLocaleString("pt-BR")} XP
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={[Colors.primaryBase, Colors.gold]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progresso * 100}%` }]}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <PrimaryButton title="CONTINUAR JORNADA" onPress={onContinue} />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "space-between",
    alignItems: "center",
  },
  topGroup: {
    alignItems: "center",
  },
  badgeWrap: {
    width: 110,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  badgeGlow: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.primaryBase,
    opacity: 0.15,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  badgeCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: GOLD_TINT_BG,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: Colors.surfaceDark,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: GOLD_SOFT_BORDER,
  },
  doneChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: GOLD_TINT_BG,
    borderWidth: 1,
    borderColor: GOLD_TINT_BORDER,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 18,
  },
  doneChipText: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  xpValue: {
    color: Colors.gold,
    fontSize: 38,
    fontWeight: "700",
    marginBottom: 4,
  },
  xpLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: GOLD_DIVIDER,
    marginVertical: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 8,
  },
  levelText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  progressText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.background,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  footer: {
    width: "100%",
  },
});
