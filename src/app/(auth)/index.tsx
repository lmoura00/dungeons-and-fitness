import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "../../constants/Colors";
import { CustomInput } from "../../components/CustomInput";
import { PrimaryButton } from "../../components/PrimaryButton";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Login:", email);
    router.push("/(tabs)/dashboard");
  };

  const handleCreateAccount = () => {
    router.push("/(auth)/register");
  };

  const handleDevBypass = () => {
    router.push("/(onboarding)/choose-race");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContent}>
            <View style={styles.logoContainer}>
              <View style={styles.placeholderLogo}>
                <Image
                  source={require("../../../assets/logo_df_circulo 1.png")}
                  style={styles.logoImage}
                />
              </View>
              <Text style={styles.appTitle}>Dungeons & Fitness</Text>
              <Text style={styles.subtitle}>
                Transforme seu sedentarismo em uma aventura épica de RPG.
              </Text>
            </View>

            <View style={styles.formCard}>
              <CustomInput
                icon="mail-outline"
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <CustomInput
                icon="lock-closed-outline"
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPassword}>Esqueci minha senha</Text>
              </TouchableOpacity>

              <PrimaryButton title="ENTRAR" onPress={handleLogin} />

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <PrimaryButton
                title="CRIAR CONTA"
                variant="outline"
                onPress={handleCreateAccount}
              />
            </View>

            <TouchableOpacity
              onPress={handleDevBypass}
              style={styles.devShortcut}
            >
              <Text style={styles.devShortcutText}>
                [Dev] Pular para Onboarding ➝
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContent: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    minHeight: 500,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: Platform.OS === "ios" ? 40 : 20,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  placeholderLogo: {
    width: 105,
    height: 105,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: 16,

    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  appTitle: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",

    textShadowColor: "rgba(245, 166, 35, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },

  formCard: {
    backgroundColor: Colors.surfaceDark,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    width: "100%",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 24,
    paddingVertical: 4,
  },
  forgotPassword: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textMuted,
    paddingHorizontal: 12,
    fontSize: 12,
    textTransform: "uppercase",
  },

  devShortcut: {
    marginTop: 32,
    padding: 12,
    alignItems: "center",
  },
  devShortcutText: {
    color: Colors.textMuted,
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
