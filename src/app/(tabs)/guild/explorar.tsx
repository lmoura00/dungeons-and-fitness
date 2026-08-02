import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "../../../constants/Colors";
import { CustomInput } from "../../../components/CustomInput";
import { ScreenHeader } from "../../../components/ScreenHeader";
import { GuildListCard } from "../../../components/GuildListCard";
import { trpc } from "../../../lib/trpc";

export default function ExplorarGuildasScreen() {
  const [busca, setBusca] = useState("");

  const { data: minhaGuilda, isLoading: loadingMinhaGuilda } = trpc.guildas.minhaGuilda.useQuery();
  const { data: guildas, isLoading: loadingGuildas } = trpc.guildas.listar.useQuery();

  const guildasFiltradas = React.useMemo(() => {
    if (!guildas) return guildas;
    const termo = busca.trim().toLowerCase();
    if (!termo) return guildas;
    return guildas.filter((g) => g.name.toLowerCase().includes(termo));
  }, [guildas, busca]);

  const isLoading = loadingMinhaGuilda || loadingGuildas;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScreenHeader
        title="Guilda"
        subtitle="Explorando outras guildas"
        showBackButton
        style={styles.header}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <CustomInput
          icon="search-outline"
          placeholder="🔍 Buscar guilda por nome..."
          value={busca}
          onChangeText={setBusca}
          containerStyle={styles.buscaInput}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        ) : !guildasFiltradas || guildasFiltradas.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Nenhuma guilda encontrada</Text>
            <Text style={styles.emptyDesc}>Tente buscar por outro nome.</Text>
          </View>
        ) : (
          <View style={styles.guildasList}>
            {guildasFiltradas.map((guilda) => {
              const suaGuilda = guilda.id === minhaGuilda?.id;
              return (
                <GuildListCard
                  key={guilda.id}
                  guilda={guilda}
                  action={
                    suaGuilda
                      ? { type: "sua-guilda", onPress: () => router.back() }
                      : { type: "indisponivel" }
                  }
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  buscaInput: {
    marginBottom: 20,
  },
  guildasList: {
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 14,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
  },
  emptyDesc: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: 24,
  },
});
