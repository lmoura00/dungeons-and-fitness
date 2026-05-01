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
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { CustomInput } from "../../components/CustomInput";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ProgressBar } from "../../components/ProgressBar"; 

export default function LogActivityScreen() {
  const [activityType, setActivityType] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [calories, setCalories] = useState("");
  
 
  const [showReward, setShowReward] = useState(false);

  const handleLogActivity = () => {

    setShowReward(true);
  };

  const handleFinishReward = () => {
    setShowReward(false);

    router.replace("/(tabs)/dashboard");
  };

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
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.header}>
              <Text style={styles.headerIcon}>➕</Text>
              <Text style={styles.headerTitle}>Registrar Atividade</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.label}>Tipo de Atividade</Text>
              <CustomInput
                placeholder="Ex: Corrida, Musculação..."
                value={activityType}
                onChangeText={setActivityType}
              />

              <Text style={styles.label}>Duração</Text>
              <View style={styles.row}>
                <View style={styles.halfInputContainer}>
                  <CustomInput
                    placeholder="Minutos"
                    value={minutes}
                    onChangeText={setMinutes}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInputContainer}>
                  <CustomInput
                    placeholder="Segundos"
                    value={seconds}
                    onChangeText={setSeconds}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.label}>Calorias (opcional)</Text>
              <CustomInput
                placeholder="Ex: 150"
                value={calories}
                onChangeText={setCalories}
                keyboardType="numeric"
              />

              <View style={styles.infoBox}>
                <Ionicons
                  name="bulb"
                  size={20}
                  color={Colors.primary}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>
                  Dica: Você ganhará XP baseado na duração e intensidade. Quanto mais desafiador, mais XP!
                </Text>
              </View>

              <PrimaryButton
                title="REGISTRAR E GANHAR XP"
                onPress={handleLogActivity}
                disabled={activityType.trim() === "" || minutes.trim() === ""}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>


      <Modal
        visible={showReward}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.rewardContent}>
            <View style={styles.glowCircle}>
              <Text style={styles.trophyIcon}>🏆</Text>
            </View>

            <Text style={styles.rewardTitle}>Missão Concluída!</Text>
            <Text style={styles.rewardSubtitle}>{activityType || "Atividade"}</Text>

            <View style={styles.xpCard}>
              <Text style={styles.xpValue}>+45 XP</Text>
              <Text style={styles.xpLabel}>Experiência Adquirida</Text>
            </View>

            <View style={styles.rewardProgressSection}>
              <View style={styles.rewardProgressHeader}>
                <Text style={styles.rewardLevelText}>Nível 1</Text>
                <Text style={styles.rewardProgressText}>45 / 1.000 XP</Text>
              </View>
              <ProgressBar progress={0.045} />
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  headerTitle: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: "bold",
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
    marginBottom: 8,
    marginLeft: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInputContainer: {
    flex: 1,
    marginHorizontal: 4,
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