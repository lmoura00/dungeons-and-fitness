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

const NAV_ITEMS = [
  { id: "dashboard", title: "Dashboard", icon: "home", route: "/(tabs)/dashboard" },
  { id: "quests", title: "Missões", icon: "list", route: "/(tabs)/quests" },
  { id: "log", title: "Registrar", icon: "add-circle", route: "/(tabs)/log-activity" },
  { id: "profile", title: "Perfil", icon: "person", route: "/(tabs)/profile" },
];

export default function DashboardScreen() {
  const handleNavPress = (route: string) => {
    if (route !== "/(tabs)/dashboard") {
      router.push(route as any);
    }
  };

  const handleFirstQuest = () => {
    router.push("/(tabs)/quests");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. HEADER COM SISTEMA DE FOGUEIRA (STREAK) */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../../assets/logo_df_circulo 1.png")}
            style={styles.smallLogo}
          />
          <Text style={styles.headerSubtitle}>Humano • Aprendiz</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakIcon}>🔥</Text>
          <Text style={styles.streakText}>0 Dias</Text>
        </View>
      </View>

      <View style={styles.navContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navScroll}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === "dashboard";
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.navButton, isActive && styles.navButtonActive]}
                onPress={() => handleNavPress(item.route)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={16}
                  color={isActive ? Colors.background : Colors.primary}
                  style={styles.navIcon}
                />
                <Text style={[styles.navText, isActive && styles.navTextActive]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* MENSAGEM DINÂMICA DE BOAS-VINDAS */}
        <Text style={styles.welcomeGreeting}>A guilda aguarda seus feitos,</Text>
        
        <View style={styles.characterCard}>
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

          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>Iniciante</Text>
          </View>
        </View>

        <View style={styles.levelSection}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelTitle}>Nível 1</Text>
            <Text style={styles.xpText}>0 / 1.000 XP</Text>
          </View>
          
          <ProgressBar progress={0} />
          
          {/* 2. TEASER DA CLASSE (Cenoura na Vara) */}
          <Text style={styles.xpRemainingText}>Alcance o Nível 5 para o Despertar da sua Classe</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Calorias</Text>
          </View>
        </View>

        {/* 3. CALL TO ACTION IMEDIATO (Missão de Boas-vindas) */}
        <TouchableOpacity style={styles.firstQuestCard} onPress={handleFirstQuest} activeOpacity={0.8}>
          <View style={styles.firstQuestIconContainer}>
            <Text style={styles.firstQuestIcon}>⚔️</Text>
          </View>
          <View style={styles.firstQuestTextContainer}>
            <Text style={styles.firstQuestTitle}>Sua Primeira Batalha</Text>
            <Text style={styles.firstQuestSubtitle}>Complete uma missão agora para ganhar seus primeiros pontos de XP!</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", 
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 10 : 50,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  smallLogo: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
 
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceDark,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  streakIcon: {
    fontSize: 14,
    marginRight: 4,
    opacity: 0.5,
  },
  streakText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "bold",
  },
  
  navContainer: { marginBottom: 24 },
  navScroll: { paddingHorizontal: 24, gap: 12 },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceDark,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  navIcon: { marginRight: 6 },
  navText: { color: Colors.primary, fontSize: 14, fontWeight: "600" },
  navTextActive: { color: Colors.background },
  
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  
  welcomeGreeting: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },

  characterCard: {
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
  avatarGlow: { padding: 6, borderRadius: 75, backgroundColor: "rgba(245, 166, 35, 0.15)", marginBottom: 16 },
  avatarCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.surface, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: Colors.primary, overflow: "hidden" },
  avatarImage: { width: 120, height: 120 },
  characterName: { color: Colors.textPrimary, fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  characterClass: { color: Colors.textSecondary, fontSize: 14, marginBottom: 16 },
  badgeContainer: { backgroundColor: Colors.surface, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.primary },
  badgeText: { color: Colors.primary, fontSize: 12, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1 },
  
  levelSection: { marginBottom: 24 },
  levelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 },
  levelTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: "bold" },
  xpText: { color: Colors.primary, fontSize: 14, fontWeight: "600" },
  xpRemainingText: { color: Colors.primary, fontSize: 12, marginTop: 8, textAlign: "right", fontWeight: "600" }, 
  
  statsRow: { flexDirection: "row", justifyContent: "space-between", gap: 16, marginBottom: 24 }, 
  statCard: { flex: 1, backgroundColor: Colors.surfaceDark, borderRadius: 16, padding: 20, alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  statValue: { color: Colors.primary, fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  statLabel: { color: Colors.textSecondary, fontSize: 12 },

 
  firstQuestCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 166, 35, 0.1)", 
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  firstQuestIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceDark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
    marginRight: 16,
  },
  firstQuestIcon: {
    fontSize: 20,
  },
  firstQuestTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  firstQuestTitle: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  firstQuestSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});