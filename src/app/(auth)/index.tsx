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
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Colors } from "../../constants/Colors";
import { CustomInput } from "../../components/CustomInput";
import { PrimaryButton } from "../../components/PrimaryButton";
import { trpc, MOCK_ATIVO } from "../../lib/trpc";
import { salvarSessao } from "../../lib/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();

  const loginMutation = trpc.auth.login.useMutation({
    async onSuccess({ token, usuarioId }) {
      // Limpa dados em cache de uma sessão anterior (ex.: outra conta usada
      // no mesmo dispositivo) antes de entrar com o novo usuário.
      queryClient.clear();
      await salvarSessao(token, usuarioId);
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo + identidade */}
          <View style={styles.brandBlock}>
            <View style={styles.logoWrap}>
              <Image
                source={require("../../../assets/logo_df_circulo 1.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.brandName}>Dungeons & Fitness</Text>
            <Text style={styles.brandTagline}>Bem-vindo de volta, aventureiro</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Entrar</Text>
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

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <PrimaryButton
              title="CRIAR CONTA"
              variant="outline"
              onPress={() => router.push("/(auth)/register")}
              style={styles.createAccountButton}
            />

            {MOCK_ATIVO && (
              <View style={styles.demoHint}>
                <Text style={styles.demoHintText}>
                  Build de demonstração (sem servidor). Entre com{" "}
                  <Text style={styles.demoHintStrong}>demo@dungeons.app</Text> e qualquer senha
                  para ver um personagem já pronto, ou crie uma conta nova.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Ao entrar você concorda com os{" "}
              <Text style={styles.footerLink}>Termos de Uso</Text>
            </Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: Platform.OS === "ios" ? 30 : 16,
    justifyContent: "center",
  },
  brandBlock: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    marginBottom: 10,
  },
  logo: {
    width: 88,
    height: 88,
  },
  brandName: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  brandTagline: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  header: {
    marginBottom: 12,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: 'rgba(232, 148, 34, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  form: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 10,
    padding: 20,
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
    height: 44,
    marginTop: 8,
    marginBottom: 0,
  },
  forgotPasswordButton: {
    alignItems: "center",
    marginTop: 12,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  createAccountButton: {
    height: 44,
    marginVertical: 0,
  },
  demoHint: {
    marginTop: 14,
    padding: 10,
    borderRadius: 8,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoHintText: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
  demoHintStrong: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
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
    marginTop: 16,
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
