import { initTRPC } from "@trpc/server";
import * as mock from "./db";

interface MockContext {
  usuarioId: string | null;
}

const t = initTRPC.context<MockContext>().create({ allowOutsideOfServer: true });

// tRPC só popula `input` no resolver se o procedure declarar `.input(...)`;
// aqui usamos um parser "passthrough" já que os dados já chegam validados do client.
const semValidacao = (valor: unknown) => valor;

const publicProcedure = t.procedure;
const privateProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.usuarioId) throw mock.Erros.naoAutenticado();
  return next({ ctx: { usuarioId: ctx.usuarioId } });
});

const publicInput = publicProcedure.input(semValidacao);
const privateInput = privateProcedure.input(semValidacao);

export const mockRouter = t.router({
  auth: t.router({
    registrar: publicInput.mutation(({ input }: any) => mock.registrar(input)),
    login: publicInput.mutation(({ input }: any) => mock.login(input)),
    solicitarResetSenha: publicInput.mutation(({ input }: any) => mock.solicitarResetSenha(input)),
    redefinirSenha: publicInput.mutation(({ input }: any) => mock.redefinirSenha(input)),
  }),

  usuarios: t.router({
    meuPerfil: privateProcedure.query(({ ctx }) => mock.meuPerfil(ctx.usuarioId)),
    atualizarPushToken: privateInput.mutation(({ ctx, input }: any) => mock.atualizarPushToken(ctx.usuarioId, input?.pushToken ?? null)),
  }),

  personagens: t.router({
    criar: privateInput.mutation(({ ctx, input }: any) => mock.criarPersonagemUsuario(ctx.usuarioId, input)),
    meuPersonagem: privateProcedure.query(({ ctx }) => mock.meuPersonagem(ctx.usuarioId)),
    trocarClasse: privateInput.mutation(({ ctx, input }: any) => mock.trocarClasseUsuario(ctx.usuarioId, input.classeId)),
  }),

  racas: t.router({
    listar: publicProcedure.query(() => mock.races),
  }),

  classes: t.router({
    listar: publicProcedure.query(() => mock.classes),
  }),

  missoesUsuario: t.router({
    hoje: privateProcedure.query(({ ctx }) => mock.missoesHoje(ctx.usuarioId)),
    gerarHoje: privateProcedure.mutation(({ ctx }) => mock.gerarMissoesHoje(ctx.usuarioId)),
    concluir: privateInput.mutation(({ ctx, input }: any) => mock.concluirMissao(ctx.usuarioId, input.missaoUsuarioId)),
  }),

  atividades: t.router({
    registrar: privateInput.mutation(({ ctx, input }: any) => mock.registrarAtividade(ctx.usuarioId, input)),
  }),

  saude: t.router({
    sincronizar: privateInput.mutation(({ ctx, input }: any) => mock.registrarSaude(ctx.usuarioId, input)),
    historico: privateInput.query(({ ctx, input }: any) => mock.historicoSaude(ctx.usuarioId, input?.dias ?? 7)),
  }),

  conquistasUsuario: t.router({
    minhasConquistas: privateProcedure.query(({ ctx }) => mock.minhasConquistas(ctx.usuarioId)),
  }),

  streak: t.router({
    atual: privateProcedure.query(({ ctx }) => mock.streakAtual(ctx.usuarioId)),
  }),

  guildas: t.router({
    listar: privateProcedure.query(() => mock.listarGuildas()),
    minhaGuilda: privateProcedure.query(({ ctx }) => mock.minhaGuilda(ctx.usuarioId)),
    criar: privateInput.mutation(({ ctx, input }: any) => mock.criarGuilda(ctx.usuarioId, input)),
    entrar: privateInput.mutation(({ ctx, input }: any) => mock.entrarGuilda(ctx.usuarioId, input.guildaId)),
    sair: privateInput.mutation(({ ctx, input }: any) => mock.sairGuilda(ctx.usuarioId, input.guildaId)),
    buscarPersonagem: privateInput.query(({ ctx, input }: any) => mock.buscarPersonagemParaConvite(ctx.usuarioId, input.nome)),
    convidar: privateInput.mutation(({ ctx, input }: any) => mock.convidarParaGuilda(ctx.usuarioId, input.guildaId, input.personagemId)),
    listarConvites: privateProcedure.query(({ ctx }) => mock.listarConvitesPendentes(ctx.usuarioId)),
    responderConvite: privateInput.mutation(({ ctx, input }: any) => mock.responderConvite(ctx.usuarioId, input.conviteId, input.aceitar)),
  }),
});
