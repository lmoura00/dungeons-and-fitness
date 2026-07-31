import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** Exiba apenas em sub-telas/formulários (fluxo). Nunca em telas do menu inferior. */
  showBackButton?: boolean;
  onBackPress?: () => void;
  /** Slot opcional à direita (badge de progresso, ação, etc.) */
  rightSlot?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const defaultBack = () =>
  router.canGoBack() ? router.back() : router.replace("/(tabs)/dashboard");

export function ScreenHeader({
  title,
  subtitle,
  showBackButton = false,
  onBackPress = defaultBack,
  rightSlot,
  style,
}: ScreenHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      {showBackButton && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
      )}
      <View style={styles.headerText}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.headerSub} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightSlot}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceDark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
});
