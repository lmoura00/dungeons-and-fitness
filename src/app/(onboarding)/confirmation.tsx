import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { PrimaryButton } from "../../components/PrimaryButton";
import { limparNovaContaPendente } from "../../lib/auth";
import { trpc } from "../../lib/trpc";
import { getAvatar, getAvatarByKey } from "../../utils/getAvatar";

export default function ConfirmationScreen() {
  const params = useLocalSearchParams<{
    raceId: string;
    raceName: string;
    characterName: string;
    avatarKey?: string;
  }>();
  const raceId        = params.raceId        || "";
  const raceName      = params.raceName      || "Anão";
  const characterName = params.characterName || "Aventureiro";
  const avatarKey     = params.avatarKey;

  const { data: usuario } = trpc.usuarios.meuPerfil.useQuery();
  const { data: classes } = trpc.classes.listar.useQuery();

  const criarMutation = trpc.personagens.criar.useMutation({
    onSuccess: () => {
      limparNovaContaPendente();
      router.replace("/(tabs)/dashboard");
    },
    onError: (e) => Alert.alert("Erro ao criar personagem", e.message),
  });

  const handleFinish = () => {
    const aprendiz = classes?.find((c) => c.unlockLevel === 0);
    if (!aprendiz) {
      Alert.alert("Erro", "Dados de classe não carregados. Tente novamente.");
      return;
    }
    criarMutation.mutate({ nome: characterName, racaId: raceId, classeId: aprendiz.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.canGoBack() ? router.back() : router.replace("/(onboarding)/choose-race")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.stepText}>PASSO 3 DE 3</Text>
        <Text style={styles.title}>Seu Aventureiro</Text>
        <Text style={styles.subtitle}>Confirme as informações do seu personagem</Text>

        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarGlow}>
              <Image
                source={
                  avatarKey
                    ? getAvatarByKey(avatarKey)
                    : getAvatar("Aprendiz", raceName, usuario?.gender)
                }
                style={styles.avatarImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.characterName}>{characterName}</Text>
            <Text style={styles.characterSubtitle}>{raceName} • Aprendiz</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Raça</Text>
              <Text style={styles.statValue}>{raceName}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Classe</Text>
              <View style={styles.lockedValue}>
                <Ionicons name="lock-closed" size={13} color={Colors.textMuted} />
                <Text style={[styles.statValue, { color: Colors.textSecondary }]}>Aprendiz</Text>
              </View>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Nível Inicial</Text>
              <Text style={styles.statValue}>1</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>XP Inicial</Text>
              <Text style={styles.statValue}>0 / 1.000 XP</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>
          <PrimaryButton
            title={criarMutation.isPending ? "CRIANDO..." : "INICIAR AVENTURA"}
            onPress={handleFinish}
            disabled={criarMutation.isPending}
          />
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
  content: {
    padding: 24,
    flexGrow: 1,
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    marginBottom: 32,
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
  stepText: {
    color: Colors.textSecondary,
    fontSize: 12,
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "700",
  },
  title: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
    textShadowColor: 'rgba(232, 148, 34, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
  },
  card: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 10,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarGlow: {
    padding: 3,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: Colors.primaryDark,
    backgroundColor: Colors.primaryMuted,
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 9999,
    backgroundColor: Colors.surfaceDark,
  },
  characterName: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 4,
  },
  characterSubtitle: {
    color: Colors.primaryBase,
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 24,
  },
  statsContainer: {
    width: "100%",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  lockedValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 32,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
});
