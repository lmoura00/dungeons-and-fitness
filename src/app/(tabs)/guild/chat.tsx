import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import { ScreenHeader } from "../../../components/ScreenHeader";
import { trpc, obterBaseUrl } from "../../../lib/trpc";
import { getAvatar } from "../../../utils/getAvatar";

type Mensagem = {
  id: string;
  guildId: string;
  characterId: string;
  content: string;
  createdAt: string;
  autor: {
    nome: string;
    nivel: number;
    raca: string | null;
    classe: string | null;
    avatarGender: string;
  };
};

const CONTEUDO_MAX = 1000;

function formatarHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function GuildChatScreen() {
  const { data: minhaGuilda, isLoading: carregandoGuilda } = trpc.guildas.minhaGuilda.useQuery();
  const { data: meuPersonagem } = trpc.personagens.meuPersonagem.useQuery();

  const guildId = minhaGuilda?.id;

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [temMais, setTemMais] = useState(true);
  const seenIds = useRef(new Set<string>());
  const historicoCarregado = useRef(false);
  const utils = trpc.useUtils();

  const adicionarMensagens = useCallback((novas: Mensagem[], noInicio: boolean) => {
    const validas = novas.filter((m) => {
      const ok = !!m && typeof m.id === "string" && typeof m.createdAt === "string";
      if (!ok) console.warn("[chat] mensagem malformada ignorada:", JSON.stringify(m));
      return ok;
    });
    const inedidas = validas.filter((m) => !seenIds.current.has(m.id));
    if (inedidas.length === 0) return;
    inedidas.forEach((m) => seenIds.current.add(m.id));
    setMensagens((atual) =>
      noInicio
        ? [...inedidas, ...atual]
        : [...atual, ...inedidas].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    );
  }, []);

  const { data: historicoInicial } = trpc.guildas.chat.historico.useQuery(
    { guildId: guildId! },
    { enabled: !!guildId }
  );

  // Reseta o flag de "já carreguei o histórico" quando troca de guilda —
  // sem isso, trocar de guilda dentro da mesma instância da tela nunca
  // recarregaria o histórico da nova guilda.
  React.useEffect(() => {
    historicoCarregado.current = false;
  }, [guildId]);

  React.useEffect(() => {
    // Flag separada de mensagens.length: a subscription pode entregar uma
    // mensagem ao vivo antes do histórico resolver, e nesse caso
    // mensagens.length já não é 0 quando historicoInicial chega.
    if (historicoInicial && !historicoCarregado.current) {
      historicoCarregado.current = true;
      adicionarMensagens(historicoInicial, false);
      setTemMais(historicoInicial.length >= 30);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historicoInicial]);

  trpc.guildas.chat.observar.useSubscription(
    { guildId: guildId! },
    {
      enabled: !!guildId,
      onData: (mensagem) => adicionarMensagens([mensagem as Mensagem], false),
    }
  );

  const enviarMutation = trpc.guildas.chat.enviar.useMutation({
    // Adiciona direto pelo retorno da mutation — não depende da subscription
    // pra quem mandou ver a própria mensagem (a live feed serve pra ecoar
    // pros outros membros; se ela atrasar/falhar, o remetente já viu a sua).
    onSuccess: (mensagem) => adicionarMensagens([mensagem as Mensagem], false),
    onError: (e) => Alert.alert("Erro ao enviar mensagem", __DEV__ ? `${e.message}\n\nURL: ${obterBaseUrl()}` : e.message),
  });

  const handleEnviar = () => {
    const conteudo = texto.trim();
    if (!conteudo || !guildId || enviarMutation.isPending) return;
    if (conteudo.length > CONTEUDO_MAX) return;
    setTexto("");
    enviarMutation.mutate({ guildId, content: conteudo });
  };

  const carregarMais = useCallback(async () => {
    if (!guildId || carregandoMais || !temMais || mensagens.length === 0) return;
    setCarregandoMais(true);
    try {
      const antigas = await utils.guildas.chat.historico.fetch({
        guildId,
        antesDe: mensagens[0].createdAt,
      });
      adicionarMensagens(antigas, true);
      setTemMais(antigas.length >= 30);
    } finally {
      setCarregandoMais(false);
    }
  }, [guildId, carregandoMais, temMais, mensagens, utils, adicionarMensagens]);

  const dataInvertida = useMemo(() => [...mensagens].reverse(), [mensagens]);

  if (carregandoGuilda) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScreenHeader title="Chat da Guilda" showBackButton />
        <View style={styles.emptyState}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!minhaGuilda) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScreenHeader title="Chat da Guilda" showBackButton />
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Você precisa estar em uma guilda pra acessar o chat.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScreenHeader title={minhaGuilda.name} subtitle="Chat da guilda" showBackButton />
        {__DEV__ && <Text style={styles.debugUrl}>API: {obterBaseUrl()}</Text>}

        {dataInvertida.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Nenhuma mensagem ainda. Diga olá pra guilda!</Text>
          </View>
        ) : (
        <FlatList
          data={dataInvertida}
          inverted
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onEndReached={carregarMais}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            carregandoMais ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: 12 }} /> : null
          }
          renderItem={({ item }) => {
            const propria = item.characterId === meuPersonagem?.id;
            const autor = item.autor ?? { nome: "?", nivel: 1, raca: null, classe: null, avatarGender: "masculino" };
            return (
              <View style={[styles.messageRow, propria && styles.messageRowPropria]}>
                {!propria && (
                  <Image
                    source={getAvatar(autor.classe, autor.raca, autor.avatarGender)}
                    style={styles.avatar}
                  />
                )}
                <View style={[styles.bubble, propria ? styles.bubblePropria : styles.bubbleOutra]}>
                  {!propria && (
                    <Text style={styles.autorNome} numberOfLines={1}>
                      {autor.nome} <Text style={styles.autorNivel}>Nv. {autor.nivel}</Text>
                    </Text>
                  )}
                  <Text style={styles.conteudo}>{item.content}</Text>
                  <Text style={styles.hora}>{formatarHora(item.createdAt)}</Text>
                </View>
              </View>
            );
          }}
        />
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Mensagem para a guilda..."
            placeholderTextColor={Colors.textMuted}
            value={texto}
            onChangeText={setTexto}
            maxLength={CONTEUDO_MAX}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!texto.trim() || enviarMutation.isPending) && styles.sendButtonDisabled]}
            onPress={handleEnviar}
            disabled={!texto.trim() || enviarMutation.isPending}
            activeOpacity={0.8}
          >
            {enviarMutation.isPending ? (
              <ActivityIndicator size="small" color={Colors.textOnPrimary} />
            ) : (
              <Ionicons name="send" size={18} color={Colors.textOnPrimary} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flexGrow: 1,
  },
  debugUrl: {
    color: Colors.crimson,
    fontSize: 10,
    textAlign: "center",
    paddingBottom: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 10,
  },
  messageRowPropria: {
    justifyContent: "flex-end",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceDark,
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  bubbleOutra: {
    backgroundColor: Colors.surfaceDark,
    borderColor: Colors.border,
    borderBottomLeftRadius: 2,
  },
  bubblePropria: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
    borderBottomRightRadius: 2,
  },
  autorNome: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  autorNivel: {
    color: Colors.textMuted,
    fontWeight: "400",
  },
  conteudo: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 19,
  },
  hora: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    color: Colors.textPrimary,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
