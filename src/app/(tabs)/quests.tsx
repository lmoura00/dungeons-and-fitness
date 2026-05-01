import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

const DAILY_QUESTS = [
  { id: "1", title: "50 Polichinelos", desc: "Faça 50 polichinelos", icon: "✈️", xp: 45 },
  { id: "2", title: "Dança 15 Minutos", desc: "Dance por 15 minutos", icon: "💃", xp: 50 },
  { id: "3", title: "30 Lunges", desc: "Faça 30 lunges (afundos)", icon: "🦵", xp: 50 },
  { id: "4", title: "Caminhada 20 Min", desc: "Caminhe 20 minutos", icon: "🚶‍♂️", xp: 40 },
  { id: "5", title: "Yoga 10 Minutos", desc: "Pratique yoga", icon: "🧘", xp: 35 },
];

export default function QuestsScreen() {
  const handleQuestPress = (questId: string) => {
    router.push("/(tabs)/log-activity");
  };

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
          <Text style={styles.headerIcon}>🎯</Text>
          <Text style={styles.headerTitle}>Missões Diárias</Text>
        </View>
        
        <Text style={styles.subtitle}>
          Complete suas missões para ganhar XP extra
        </Text>

        <View style={styles.questsList}>
          {DAILY_QUESTS.map((quest) => (
            <TouchableOpacity 
              key={quest.id} 
              style={styles.questCard}
              activeOpacity={0.7}
              onPress={() => handleQuestPress(quest.id)}
            >
              <View style={styles.questLeft}>
                <View style={styles.iconContainer}>
                  <Text style={styles.questIcon}>{quest.icon}</Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                  <Text style={styles.questDesc}>{quest.desc}</Text>
                </View>
              </View>
              
              <View style={styles.xpBadge}>
                <Text style={styles.xpBadgeText}>+{quest.xp} XP</Text>
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 10 : 50,
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
    marginBottom: 8,
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
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  questsList: {
    gap: 16,
  },
  questCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceDark,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  questIcon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  questTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  questDesc: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  xpBadge: {
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  xpBadgeText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: "bold",
  },
});