import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Colors } from "../../constants/Colors";

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.logoWrap}>
          <Image
            source={require("../../../assets/logo_df_circulo 1.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Dungeons & Fitness</Text>
        <Text style={styles.tagline}>Transforme treinos em conquistas épicas</Text>
      </Animated.View>

      <Animated.View style={[styles.buttonArea, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(auth)")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>COMEÇAR AVENTURA</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    gap: 16,
  },
  logoWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    marginBottom: 8,
  },
  logo: {
    width: 140,
    height: 140,
  },
  title: {
    color: Colors.primary,
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
    textShadowColor: Colors.primaryMuted,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  tagline: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  buttonArea: {
    width: "100%",
    paddingBottom: 48,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
});
