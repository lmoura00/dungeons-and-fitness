import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { ProgressBar } from "../../components/ProgressBar";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="person" size={20} color={Colors.primary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Ficha de Personagem</Text>
        </View>

        <View style={styles.avatarCard}>
          <View style={styles.avatarGlow}>
            <View style={styles.avatarCircle}>
              <Image
                source={{ uri: "https://api.dicebear.com/8.x/adventurer/png?seed=Hero&backgroundColor=F5A623" }}
                style={styles.avatarImage}
              />
            </View>
          </View>
          <Text style={styles.characterName}>Aventureiro</Text>
          <Text style={styles.characterClass}>Humano • Aprendiz</Text>
        </View>

        <View style={styles.patamarCard}>
          <Text style={styles.patamarTitle}>PATAMAR</Text>
          
          <View style={styles.patamarRow}>
            <Text style={styles.patamarLabel}>Nível Atual</Text>
            <Text style={styles.patamarValueHighlight}>Iniciante</Text>
          </View>
          
          <View style={styles.patamarRow}>
            <Text style={styles.patamarLabel}>Experiência</Text>
            <Text style={styles.patamarValue}>0 / 1.000 XP</Text>
          </View>
          
          <ProgressBar progress={0} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Conquistas</Text>
          </View>
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 10 : 30,
    marginBottom: 8,
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
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: "bold",
  },
  avatarCard: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarGlow: {
    padding: 6,
    borderRadius: 75,
    backgroundColor: "rgba(245, 166, 35, 0.15)",
    marginBottom: 16,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.primary,
    overflow: "hidden",
  },
  avatarImage: {
    width: 120,
    height: 120,
  },
  characterName: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  characterClass: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  patamarCard: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  patamarTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 24,
  },
  patamarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  patamarLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  patamarValueHighlight: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
  patamarValue: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});