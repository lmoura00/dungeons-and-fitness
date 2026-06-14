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
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { CustomInput } from "../../components/CustomInput";
import { PrimaryButton } from "../../components/PrimaryButton";
import { trpc } from "../../lib/trpc";
import { salvarSessao } from "../../lib/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    async onSuccess({ token, usuarioId }) {
      await salvarSessao(token, usuarioId);
      router.replace("/(tabs)/dashboard");
    },
    onError(error) {
      Alert.alert("Erro ao entrar", error.message);
    },
  });

  const handleLogin = () => {
    if (!email.trim() || !password) {
      Alert.alert("Atenção", "Preencha e-mail e senha.");
      return;
    }
    loginMutation.mutate({ email: email.trim(), senha: password });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.logoWrap}>
              <Image
                source={require("../../../assets/logo_df_circulo 1.png")}
                style={styles.logoImage}
              />
            </View>
            <Text style={styles.appTitle}>Dungeons & Fitness</Text>
            <Text style={styles.tagline}>
              Transforme treinos em conquistas épicas
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.formLabel}>E-mail</Text>
            <CustomInput
              icon="mail-outline"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.formLabel}>Senha</Text>
            <View style={styles.passwordWrap}>
              <CustomInput
                icon="lock-closed-outline"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <PrimaryButton
              title={loginMutation.isPending ? "ENTRANDO..." : "ENTRAR"}
              onPress={handleLogin}
              disabled={loginMutation.isPending}
              style={styles.loginButton}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <PrimaryButton
              title="CRIAR CONTA"
              variant="outline"
              onPress={() => router.push("/(auth)/register")}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Ao entrar você concorda com os{" "}
              <Text style={styles.footerLink}>Termos de Uso</Text>
            </Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    justifyContent: "center",
  },
  hero: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surfaceDark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  logoImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  appTitle: {
    color: Colors.primary,
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
    textShadowColor: "rgba(245, 166, 35, 0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  form: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginLeft: 4,
  },
  passwordWrap: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 16,
    justifyContent: "center",
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 0,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
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
    letterSpacing: 1,
  },
  footer: {
    alignItems: "center",
    marginTop: 28,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: "600",
  },
});
