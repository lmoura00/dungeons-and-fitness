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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { CustomInput } from "../../components/CustomInput";
import { PrimaryButton } from "../../components/PrimaryButton";
import { trpc, MOCK_ATIVO } from "../../lib/trpc";

export default function ForgotPasswordScreen() {
  const [etapa, setEtapa] = useState<"email" | "redefinir">("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const solicitarMutation = trpc.auth.solicitarResetSenha.useMutation({
    onSuccess() {
      setEtapa("redefinir");
      Alert.alert("Verifique seu e-mail", "Se o e-mail existir, um código foi enviado.");
    },
    onError(error) {
      Alert.alert("Erro", error.message);
    },
  });

  const redefinirMutation = trpc.auth.redefinirSenha.useMutation({
    onSuccess() {
      Alert.alert("Pronto!", "Senha redefinida com sucesso. Faça login com a nova senha.");
      router.replace("/(auth)");
    },
    onError(error) {
      Alert.alert("Erro", error.message);
    },
  });

  const handleSolicitar = () => {
    if (!email.trim()) {
      Alert.alert("Atenção", "Informe seu e-mail.");
      return;
    }
    solicitarMutation.mutate({ email: email.trim() });
  };

  const handleRedefinir = () => {
    if (!codigo.trim() || !novaSenha) {
      Alert.alert("Atenção", "Preencha o código e a nova senha.");
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert("Atenção", "A senha precisa ter ao menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      Alert.alert("Atenção", "As senhas não coincidem.");
      return;
    }
    redefinirMutation.mutate({ email: email.trim(), codigo: codigo.trim(), novaSenha });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.headerTitle}>Recuperar senha</Text>
              <Text style={styles.headerSubtitle}>
                {etapa === "email"
                  ? "Informe seu e-mail para receber um código de redefinição."
                  : "Digite o código recebido por e-mail e escolha uma nova senha."}
              </Text>
            </View>

            <View style={styles.form}>
              {etapa === "email" ? (
                <>
                  <Text style={styles.formLabel}>E-mail</Text>
                  <CustomInput
                    icon="mail-outline"
                    placeholder="seu@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <PrimaryButton
                    title={solicitarMutation.isPending ? "ENVIANDO..." : "ENVIAR CÓDIGO"}
                    onPress={handleSolicitar}
                    disabled={solicitarMutation.isPending}
                    style={styles.actionButton}
                  />
                </>
              ) : (
                <>
                  {MOCK_ATIVO && (
                    <Text style={styles.mockCodeHint}>
                      Build de demonstração: use o código 123456.
                    </Text>
                  )}
                  <Text style={styles.formLabel}>Código recebido</Text>
                  <CustomInput
                    icon="key-outline"
                    placeholder="000000"
                    value={codigo}
                    onChangeText={setCodigo}
                    keyboardType="number-pad"
                    maxLength={6}
                  />

                  <Text style={styles.formLabel}>Nova senha</Text>
                  <View style={styles.passwordWrap}>
                    <CustomInput
                      icon="lock-closed-outline"
                      placeholder="••••••••"
                      value={novaSenha}
                      onChangeText={setNovaSenha}
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

                  <Text style={styles.formLabel}>Confirmar nova senha</Text>
                  <CustomInput
                    icon="lock-closed-outline"
                    placeholder="••••••••"
                    value={confirmarSenha}
                    onChangeText={setConfirmarSenha}
                    secureTextEntry={!showPassword}
                  />

                  <PrimaryButton
                    title={redefinirMutation.isPending ? "REDEFININDO..." : "REDEFINIR SENHA"}
                    onPress={handleRedefinir}
                    disabled={redefinirMutation.isPending}
                    style={styles.actionButton}
                  />

                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleSolicitar}
                    disabled={solicitarMutation.isPending}
                  >
                    <Text style={styles.resendText}>Reenviar código</Text>
                  </TouchableOpacity>
                </>
              )}
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
    paddingTop: Platform.OS === "ios" ? 20 : 16,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 20 : 16,
    left: 24,
    padding: 4,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 8,
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
  mockCodeHint: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
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
  actionButton: {
    height: 44,
    marginTop: 8,
    marginBottom: 0,
  },
  resendButton: {
    alignItems: "center",
    marginTop: 14,
  },
  resendText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
});
