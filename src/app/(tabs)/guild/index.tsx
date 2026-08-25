import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "../../../constants/Colors";
import { CustomInput } from "../../../components/CustomInput";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { ProgressBar } from "../../../components/ProgressBar";
import { ScreenHeader } from "../../../components/ScreenHeader";
import { GuildEmblemIcon, GUILD_EMBLEMAS, type GuildEmblem } from "../../../components/GuildEmblemIcon";
import { GuildListCard, MAX_MEMBROS_GUILDA } from "../../../components/GuildListCard";
import { trpc } from "../../../lib/trpc";
import { getAvatar } from "../../../utils/getAvatar";

const GUILD_XP_POR_NIVEL = 5000;

export default function GuildScreen() {
  const utils = trpc.useUtils();
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [emblema, setEmblema] = useState<GuildEmblem>("escudo");
  const [busca, setBusca] = useState("");
  const [confirmarSairVisible, setConfirmarSairVisible] = useState(false);
  const [convidarModalVisible, setConvidarModalVisible] = useState(false);
  const [buscaConvite, setBuscaConvite] = useState("");

  const { data: minhaGuilda, isLoading: loadingMinhaGuilda } = trpc.guildas.minhaGuilda.useQuery();
  const { data: guildas, isLoading: loadingGuildas } = trpc.guildas.listar.useQuery(undefined, {
    enabled: !loadingMinhaGuilda,
  });
  const { data: meuPersonagem } = trpc.personagens.meuPersonagem.useQuery();
  const { data: convites } = trpc.guildas.listarConvites.useQuery();
  const { data: solicitacoes } = trpc.guildas.listarSolicitacoes.useQuery();

  const souLider = !!minhaGuilda && !!meuPersonagem && minhaGuilda.leaderId === meuPersonagem.id;

  const buscaConviteTrim = buscaConvite.trim();
  const { data: resultadosBusca, isFetching: buscandoPersonagem } = trpc.guildas.buscarPersonagem.useQuery(
    { nome: buscaConviteTrim },
    { enabled: convidarModalVisible && buscaConviteTrim.length >= 2 }
  );

  const guildLevel = minhaGuilda ? Math.floor(minhaGuilda.totalXp / GUILD_XP_POR_NIVEL) + 1 : 1;
  const guildXpAtual = minhaGuilda ? minhaGuilda.totalXp % GUILD_XP_POR_NIVEL : 0;
  const guildProgress = guildXpAtual / GUILD_XP_POR_NIVEL;

  const ranking = React.useMemo(() => {
    if (!minhaGuilda || !guildas) return null;
    const ordenadas = [...guildas].sort((a, b) => b.totalXp - a.totalXp);
    const posicao = ordenadas.findIndex((g) => g.id === minhaGuilda.id) + 1;
    return posicao > 0 ? { posicao, total: ordenadas.length } : null;
  }, [minhaGuilda, guildas]);

  const guildasFiltradas = React.useMemo(() => {
    if (!guildas) return guildas;
    const termo = busca.trim().toLowerCase();
    if (!termo) return guildas;
    return guildas.filter((g) => g.name.toLowerCase().includes(termo));
  }, [guildas, busca]);

  const invalidarGuildas = () => {
    utils.guildas.minhaGuilda.invalidate();
    utils.guildas.listar.invalidate();
  };

  const convidarMutation = trpc.guildas.convidar.useMutation({
    onSuccess: () => {
      Alert.alert("Convite enviado!", "O personagem vai receber uma notificação.");
      setBuscaConvite("");
    },
    onError: (e) => Alert.alert("Erro ao convidar", e.message),
  });

  const criarMutation = trpc.guildas.criar.useMutation({
    onSuccess: () => {
      setModalVisible(false);
      setNome("");
      setDescricao("");
      setEmblema("escudo");
      invalidarGuildas();
    },
    onError: (e) => Alert.alert("Erro ao criar guilda", e.message),
  });

  const solicitarEntradaMutation = trpc.guildas.solicitarEntrada.useMutation({
    onSuccess: () => Alert.alert("Pedido enviado!", "O líder da guilda vai receber sua solicitação."),
    onError: (e) => Alert.alert("Erro ao solicitar entrada", e.message),
  });

  const sairMutation = trpc.guildas.sair.useMutation({
    onSuccess: invalidarGuildas,
    onError: (e) => Alert.alert("Erro ao sair da guilda", e.message),
  });

  const handleCriar = () => {
    if (nome.trim().length < 3) {
      Alert.alert("Atenção", "O nome da guilda precisa ter pelo menos 3 caracteres.");
      return;
    }
    criarMutation.mutate({ nome: nome.trim(), descricao: descricao.trim() || undefined, emblema });
  };

  const handleSair = () => {
    if (!minhaGuilda) return;
    setConfirmarSairVisible(true);
  };

  const confirmarSair = () => {
    if (!minhaGuilda) return;
    setConfirmarSairVisible(false);
    sairMutation.mutate({ guildaId: minhaGuilda.id });
  };

  const isLoading = loadingMinhaGuilda || (!minhaGuilda && loadingGuildas);

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
        subtitle={minhaGuilda ? minhaGuilda.name : "Junte-se a uma guilda ou funde a sua"}
        style={styles.header}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {convites && convites.length > 0 ? (
          <TouchableOpacity
            style={styles.convitesLink}
            onPress={() => router.push("/(tabs)/guild/convites")}
            activeOpacity={0.7}
          >
            <Ionicons name="mail-unread-outline" size={16} color={Colors.textOnPrimary} />
            <Text style={styles.convitesLinkText}>
              Você tem {convites.length} convite{convites.length > 1 ? "s" : ""} de guilda
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textOnPrimary} />
          </TouchableOpacity>
        ) : null}

        {solicitacoes && solicitacoes.length > 0 ? (
          <TouchableOpacity
            style={styles.convitesLink}
            onPress={() => router.push("/(tabs)/guild/solicitacoes")}
            activeOpacity={0.7}
          >
            <Ionicons name="person-add-outline" size={16} color={Colors.textOnPrimary} />
            <Text style={styles.convitesLinkText}>
              {solicitacoes.length} pedido{solicitacoes.length > 1 ? "s" : ""} para entrar na sua guilda
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textOnPrimary} />
          </TouchableOpacity>
        ) : null}

        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        ) : minhaGuilda ? (
          <>
            <View style={styles.guildCard}>
              {/* Cabeçalho do clã */}
              <View style={styles.crestFrame}>
                <LinearGradient
                  colors={[Colors.gold, Colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.crestRing}
                >
                  <View style={styles.crestInner}>
                    <GuildEmblemIcon emblem={minhaGuilda.emblem as GuildEmblem} size={40} />
                  </View>
                </LinearGradient>
              </View>
              <Text style={styles.guildName}>{minhaGuilda.name}</Text>
              <Text style={styles.guildMotto}>
                {minhaGuilda.description || "Um estandarte, uma honra, uma guilda."}
              </Text>

              {/* Nível, XP e ranking */}
              <View style={styles.statusBlock}>
                <View style={styles.statusRow}>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusValue}>Nv. {guildLevel}</Text>
                    <Text style={styles.statusLabel}>Nível da Guilda</Text>
                  </View>
                  <View style={styles.statusDivider} />
                  <View style={styles.statusItem}>
                    <Text style={styles.statusValue}>
                      {ranking ? `#${ranking.posicao}` : "—"}
                    </Text>
                    <Text style={styles.statusLabel}>
                      {ranking ? `de ${ranking.total} guildas` : "Ranking Geral"}
                    </Text>
                  </View>
                </View>

                <View style={styles.xpBlock}>
                  <View style={styles.xpBlockHeader}>
                    <Text style={styles.xpBlockLabel}>XP do Clã</Text>
                    <Text style={styles.xpBlockValue}>
                      {guildXpAtual.toLocaleString("pt-BR")} / {GUILD_XP_POR_NIVEL.toLocaleString("pt-BR")}
                    </Text>
                  </View>
                  <ProgressBar progress={guildProgress} />
                </View>
              </View>

              {/* Roster de membros */}
              <Text style={styles.sectionLabel}>Membros ({minhaGuilda.members.length})</Text>
              <View style={styles.membersList}>
                {minhaGuilda.members.map((membro) => (
                  <View key={membro.id} style={styles.memberCard}>
                    <Image
                      source={getAvatar(membro.character.class?.name, membro.character.race?.name, membro.character.avatarGender)}
                      style={styles.memberAvatar}
                    />
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName} numberOfLines={1}>
                        {membro.character.name}
                      </Text>
                      <Text style={styles.memberMeta} numberOfLines={1}>
                        {membro.character.class?.name ?? "Aventureiro"} • Nv. {membro.character.level}
                      </Text>
                    </View>
                    <View style={[styles.roleTag, membro.role === "lider" && styles.roleTagLeader]}>
                      <Text style={[styles.roleTagText, membro.role === "lider" && styles.roleTagTextLeader]}>
                        {membro.role === "lider" ? "Líder" : "Membro"}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {souLider && minhaGuilda.members.length < MAX_MEMBROS_GUILDA ? (
                <TouchableOpacity
                  style={styles.convidarButton}
                  onPress={() => setConvidarModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person-add-outline" size={16} color={Colors.primary} />
                  <Text style={styles.convidarButtonText}>Convidar Membro</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.explorarLink}
              onPress={() => router.push("/(tabs)/guild/explorar")}
              activeOpacity={0.7}
            >
              <Ionicons name="compass-outline" size={16} color={Colors.primary} />
              <Text style={styles.explorarLinkText}>Ver outras guildas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sairButton}
              onPress={handleSair}
              disabled={sairMutation.isPending}
              activeOpacity={0.7}
            >
              {sairMutation.isPending ? (
                <ActivityIndicator size="small" color={Colors.textMuted} />
              ) : (
                <Text style={styles.sairButtonText}>Sair da Guilda</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.criarButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={18} color={Colors.textOnPrimary} />
              <Text style={styles.criarButtonText}>Fundar Guilda</Text>
            </TouchableOpacity>

            <CustomInput
              icon="search-outline"
              placeholder="🔍 Buscar guilda por nome..."
              value={busca}
              onChangeText={setBusca}
              containerStyle={styles.buscaInput}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {!guildas || guildas.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="shield-outline" size={80} color={Colors.primaryBase} />
                </View>
                <Text style={styles.emptyTitle}>Nenhuma guilda fundada</Text>
                <Text style={styles.emptyDesc}>
                  Seja o primeiro a erguer o estandarte de uma guilda nesse reino.
                </Text>
              </View>
            ) : !guildasFiltradas || guildasFiltradas.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>Nenhuma guilda encontrada</Text>
                <Text style={styles.emptyDesc}>
                  Tente buscar por outro nome.
                </Text>
              </View>
            ) : (
              <View style={styles.guildasList}>
                {guildasFiltradas.map((guilda) => (
                  <GuildListCard
                    key={guilda.id}
                    guilda={guilda}
                    action={{
                      type: "entrar",
                      onPress: () => solicitarEntradaMutation.mutate({ guildaId: guilda.id }),
                      pending: solicitarEntradaMutation.isPending && solicitarEntradaMutation.variables?.guildaId === guilda.id,
                      cheia: guilda.members.length >= MAX_MEMBROS_GUILDA,
                    }}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalKeyboardView}
            >
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Fundar Guilda</Text>

                <Text style={styles.emblemaLabel}>Emblema da Guilda</Text>
                <View style={styles.emblemaRow}>
                  {GUILD_EMBLEMAS.map((opcao) => {
                    const ativo = emblema === opcao.key;
                    return (
                      <TouchableOpacity
                        key={opcao.key}
                        style={[styles.emblemaOption, ativo && styles.emblemaOptionAtiva]}
                        onPress={() => setEmblema(opcao.key)}
                        activeOpacity={0.8}
                      >
                        <GuildEmblemIcon
                          emblem={opcao.key}
                          size={26}
                          color={ativo ? Colors.gold : Colors.textMuted}
                        />
                        <Text style={[styles.emblemaOptionLabel, ativo && styles.emblemaOptionLabelAtiva]}>
                          {opcao.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <CustomInput
                  icon="shield-outline"
                  placeholder="Nome da guilda"
                  value={nome}
                  onChangeText={setNome}
                  maxLength={100}
                />
                <CustomInput
                  icon="document-text-outline"
                  placeholder="Descrição (opcional)"
                  value={descricao}
                  onChangeText={setDescricao}
                  maxLength={255}
                  multiline
                />
                <PrimaryButton
                  title={criarMutation.isPending ? "Fundando Guilda..." : "Fundar Guilda"}
                  onPress={handleCriar}
                  disabled={criarMutation.isPending}
                />
                <PrimaryButton
                  title="Cancelar"
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                  disabled={criarMutation.isPending}
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={convidarModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setConvidarModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalKeyboardView}
            >
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Convidar Membro</Text>

                <CustomInput
                  icon="search-outline"
                  placeholder="Buscar personagem por nome..."
                  value={buscaConvite}
                  onChangeText={setBuscaConvite}
                  containerStyle={styles.buscaInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <ScrollView style={styles.convidarResultados}>
                  {buscandoPersonagem ? (
                    <ActivityIndicator color={Colors.primary} style={{ marginTop: 12 }} />
                  ) : buscaConviteTrim.length < 2 ? (
                    <Text style={styles.convidarHint}>Digite ao menos 2 letras para buscar.</Text>
                  ) : !resultadosBusca || resultadosBusca.length === 0 ? (
                    <Text style={styles.convidarHint}>Nenhum personagem encontrado.</Text>
                  ) : (
                    resultadosBusca.map((personagem) => (
                      <View key={personagem.id} style={styles.convidarResultCard}>
                        <Image
                          source={getAvatar(personagem.class?.name, personagem.race?.name, personagem.avatarGender)}
                          style={styles.memberAvatar}
                        />
                        <View style={styles.memberInfo}>
                          <Text style={styles.memberName} numberOfLines={1}>{personagem.name}</Text>
                          <Text style={styles.memberMeta} numberOfLines={1}>
                            {personagem.class?.name ?? "Aventureiro"} • Nv. {personagem.level}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.convidarResultButton}
                          onPress={() => minhaGuilda && convidarMutation.mutate({ guildaId: minhaGuilda.id, personagemId: personagem.id })}
                          disabled={convidarMutation.isPending}
                          activeOpacity={0.8}
                        >
                          {convidarMutation.isPending && convidarMutation.variables?.personagemId === personagem.id ? (
                            <ActivityIndicator size="small" color={Colors.textOnPrimary} />
                          ) : (
                            <Text style={styles.convidarResultButtonText}>Convidar</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </ScrollView>

                <PrimaryButton
                  title="Fechar"
                  variant="outline"
                  onPress={() => {
                    setConvidarModalVisible(false);
                    setBuscaConvite("");
                  }}
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={confirmarSairVisible} animationType="fade" transparent>
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Sair da Guilda</Text>
            <Text style={styles.confirmMessage}>
              Tem certeza que deseja sair de "{minhaGuilda?.name}"?
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancelButton}
                onPress={() => setConfirmarSairVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmSairButton}
                onPress={confirmarSair}
                disabled={sairMutation.isPending}
                activeOpacity={0.8}
              >
                {sairMutation.isPending ? (
                  <ActivityIndicator size="small" color={Colors.textOnPrimary} />
                ) : (
                  <Text style={styles.confirmSairText}>Sair</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  guildCard: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    alignItems: "center",
  },
  crestFrame: {
    marginBottom: 12,
  },
  crestRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  crestInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceDark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.background,
  },
  guildName: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  guildMotto: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 19,
  },
  statusBlock: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginTop: 18,
    width: "100%",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusItem: {
    flex: 1,
    alignItems: "center",
  },
  statusDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  statusValue: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  statusLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  xpBlock: {
    marginTop: 16,
  },
  xpBlockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  xpBlockLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  xpBlockValue: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    alignSelf: "flex-start",
    marginTop: 20,
    marginBottom: 8,
  },
  membersList: {
    width: "100%",
    gap: 8,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceDark,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  memberMeta: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  roleTag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleTagLeader: {
    backgroundColor: "rgba(212, 168, 75, 0.15)",
    borderColor: Colors.gold,
  },
  roleTagText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  roleTagTextLeader: {
    color: Colors.gold,
  },
  convitesLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  convitesLinkText: {
    color: Colors.textOnPrimary,
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
  },
  convidarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignSelf: "center",
  },
  convidarButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  convidarResultados: {
    maxHeight: 320,
    marginBottom: 16,
  },
  convidarHint: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 20,
  },
  convidarResultCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  convidarResultButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    minWidth: 76,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  convidarResultButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 12,
    fontWeight: "bold",
  },
  explorarLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 20,
  },
  explorarLinkText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  sairButton: {
    marginTop: 24,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.textMuted,
    minWidth: 150,
    alignItems: "center",
  },
  sairButtonText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  criarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    marginBottom: 20,
  },
  criarButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 15,
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 14,
  },
  emptyIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
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
  buscaInput: {
    marginBottom: 20,
  },
  guildasList: {
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalKeyboardView: {
    width: "100%",
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  emblemaLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
  },
  emblemaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  emblemaOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emblemaOptionAtiva: {
    backgroundColor: "rgba(212, 168, 75, 0.15)",
    borderColor: Colors.gold,
  },
  emblemaOptionLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  emblemaOptionLabelAtiva: {
    color: Colors.gold,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  confirmCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
  },
  confirmTitle: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
  },
  confirmMessage: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  confirmActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  confirmCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmCancelText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  confirmSairButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.crimson,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmSairText: {
    color: Colors.textOnPrimary,
    fontSize: 13,
    fontWeight: "bold",
  },
});
