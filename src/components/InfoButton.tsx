import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

interface InfoButtonProps {
  title: string;
  paragrafos: string[];
  size?: number;
  color?: string;
}

// Ícone de "i" que abre um modal curto com uma explicação. Reusável
// (XP, streaks, missões, etc.).
export function InfoButton({ title, paragrafos, size = 15, color = Colors.textMuted }: InfoButtonProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setAberto(true)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={`Informações: ${title}`}
      >
        <Ionicons name="information-circle-outline" size={size} color={color} />
      </Pressable>

      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAberto(false)}>
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable onPress={() => setAberto(false)} hitSlop={10}>
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </Pressable>
            </View>
            {paragrafos.map((p, i) => (
              <Text key={i} style={styles.paragrafo}>
                {p}
              </Text>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  paragrafo: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
});
