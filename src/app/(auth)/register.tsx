import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { CustomInput } from "../../components/CustomInput";
import { PrimaryButton } from "../../components/PrimaryButton";
import { trpc } from "../../lib/trpc";
import { marcarNovaContaPendente } from "../../lib/auth";

const GENERO_MAP = { M: "masculino", F: "feminino", O: "nao_binario" } as const;
const GENEROS = [
  { key: "M", label: "Masculino", ionicon: "male"        },
  { key: "F", label: "Feminino",  ionicon: "female"      },
  { key: "O", label: "Outro",     ionicon: "male-female" },
] as const;

type FeedbackType = { type: "success" | "error"; message: string } | null;

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState<"M" | "F" | "O">("M");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const showError = (message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFeedback({ type: "error", message });
    timerRef.current = setTimeout(() => setFeedback(null), 5000);
  };

  const registerMutation = trpc.auth.registrar.useMutation({
    onSuccess() {
      marcarNovaContaPendente();
      setFeedback({ type: "success", message: "Conta criada! Faça login para continuar." });
      setTimeout(() => router.replace("/(auth)"), 1500);
    },
    onError(error) {
      showError(error.message);
    },
  });

  const enviando = registerMutation.isPending;

  const handleRegister = () => {
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      showError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (password.length < 6) {
      showError("A senha precisa ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      showError("As senhas não coincidem.");
      return;
    }
    const pesoKg = Number(weight.replace(",", "."));
    const alturaCm = Number(height.replace(",", "."));
    if (!weight.trim() || !height.trim() || !Number.isFinite(pesoKg) || !Number.isFinite(alturaCm) || pesoKg <= 0 || alturaCm <= 0) {
      showError("Informe peso e altura válidos.");
      return;
    }
    registerMutation.mutate({
      email: email.trim(),
      senha: password,
      nomeUsuario: username.trim(),
      nomeCompleto: name.trim(),
      genero: GENERO_MAP[gender],
      pesoKg,
      alturaCm,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {feedback && (
        <View style={[styles.toast, feedback.type === "success" ? styles.toastSuccess : styles.toastError]}>
          <Ionicons
            name={feedback.type === "success" ? "checkmark-circle" : "alert-circle"}
            size={18}
            color={feedback.type === "success" ? "#4CAF50" : "#EF4444"}
          />
          <Text style={styles.toastText}>{feedback.message}</Text>
          {feedback.type === "error" && (
            <TouchableOpacity onPress={() => setFeedback(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator
          indicatorStyle="white"
          persistentScrollbar
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          extraScrollHeight={24}
          keyboardOpeningTime={0}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.canGoBack() ? router.back() : router.replace("/(auth)")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.heroTitle}>Nova Jornada</Text>
            <View style={styles.backButtonSpacer} />
          </View>

          <View style={styles.hero}>
            <Text style={styles.heroSub}>Crie sua conta e comece a aventura</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CONTA</Text>

            <Text style={styles.fieldLabel}>Nome completo</Text>
            <CustomInput
              icon="person-outline"
              placeholder="Seu nome"
              value={name}
              onChangeText={setName}
              containerStyle={styles.compactField}
            />

            <Text style={styles.fieldLabel}>Nome de usuário</Text>
            <CustomInput
              icon="at-outline"
              placeholder="@seuusuario"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              containerStyle={styles.compactField}
            />

            <Text style={styles.fieldLabel}>E-mail</Text>
            <CustomInput
              icon="mail-outline"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={styles.compactField}
            />

            <Text style={styles.fieldLabel}>Senha</Text>
            <View style={styles.passwordWrap}>
              <CustomInput
                icon="lock-closed-outline"
                placeholder="Mín. 6 caracteres"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                containerStyle={styles.compactField}
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

            <Text style={styles.fieldLabel}>Confirmar senha</Text>
            <CustomInput
              icon="checkmark-circle-outline"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              containerStyle={styles.compactField}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PERFIL</Text>
            <Text style={styles.fieldLabel}>Gênero</Text>
            <View style={styles.generoRow}>
              {GENEROS.map((g) => (
                <TouchableOpacity
                  key={g.key}
                  style={[styles.generoButton, gender === g.key && styles.generoButtonAtivo]}
                  onPress={() => setGender(g.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={g.ionicon as any}
                    size={18}
                    color={gender === g.key ? Colors.primary : Colors.textMuted}
                  />
                  <Text style={[styles.generoLabel, gender === g.key && styles.generoLabelAtivo]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.rowFields}>
              <View style={styles.rowField}>
                <Text style={styles.fieldLabel}>Peso (kg)</Text>
                <CustomInput
                  icon="barbell-outline"
                  placeholder="Ex: 70"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.rowField}>
                <Text style={styles.fieldLabel}>Altura (cm)</Text>
                <CustomInput
                  icon="resize-outline"
                  placeholder="Ex: 175"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              title={enviando ? "CRIANDO CONTA..." : "CRIAR CONTA"}
              onPress={handleRegister}
              disabled={enviando}
              style={styles.submitButton}
            />
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>

      <LinearGradient
        colors={["transparent", Colors.background]}
        pointerEvents="none"
        style={styles.scrollFade}
      />
    </SafeAreaView>
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
    paddingTop: 16,
  },
  scrollFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 28,
  },
  toast: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16,
    zIndex: 999,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  toastSuccess: {
    backgroundColor: "#0d2010",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  toastError: {
    backgroundColor: "#2a1010",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  toastText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surfaceDark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backButtonSpacer: {
    width: 34,
  },
  hero: {
    marginBottom: 10,
  },
  heroTitle: {
    flex: 1,
    color: Colors.primary,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: 'rgba(232, 148, 34, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  heroSub: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
  section: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 3,
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  compactField: {
    marginBottom: 8,
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
  generoRow: {
    flexDirection: "row",
    gap: 8,
  },
  rowFields: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  rowField: {
    flex: 1,
  },
  generoButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
    gap: 4,
  },
  generoButtonAtivo: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primaryDark,
  },
  generoLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  generoLabelAtivo: {
    color: Colors.primary,
  },
  actions: {
    marginTop: 4,
  },
  submitButton: {
    height: 48,
  },
  divider: {
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
    letterSpacing: 1,
  },
});
