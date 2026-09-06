# Enviar build Android pra Play Store — o que falta

Status em 2026-09-06: build de produção pronto, falta só a credencial de API do Play Console pra rodar o `eas submit`.

## Onde parou

- `eas build --platform android --profile production` já rodou com sucesso, gerou o `.aab` com o fix de FCM (ver `PUSH_NOTIFICATIONS_SETUP.md`)
- Ao rodar `eas submit --platform android --profile production --latest`, o único "Google Service Account Key" que aparece salvo no EAS é o do **Firebase** (`firebase-adminsdk-fbsvc@dungeons-bb8de...`) — **não serve**, é a chave do FCM, sem nenhuma permissão no Google Play Console
- Conclusão: o `versionCode 2` (teste fechado, publicado em 2026-08-30) foi enviado por **upload manual** no Play Console, nunca existiu uma credencial de API real configurada
- A página clássica "Configuração → Acesso à API" **não existe mais** nessa conta do Play Console (reorganização do Google) — o fluxo atual é criar a service account direto no Google Cloud e convidá-la como usuário no Play Console

## Passo a passo pra retomar

### 1. Criar a service account no Google Cloud Console
1. [console.cloud.google.com](https://console.cloud.google.com/) → selecionar/criar um projeto (sugestão: `dungeons-play-publish`)
2. Menu → **IAM e administrador** → **Contas de serviço** → **Criar conta de serviço**
3. Nome: `eas-play-submit` → Concluir (sem role no projeto)

### 2. Ativar a Google Play Android Developer API
- Nesse mesmo projeto do Cloud: **APIs e serviços** → **Biblioteca** → buscar **"Google Play Android Developer API"** → **Ativar**

### 3. Gerar a chave JSON
- **IAM e administrador → Contas de serviço** → clicar na `eas-play-submit` → aba **Chaves** → **Adicionar chave** → **Criar nova chave** → **JSON** → baixa o arquivo
- Guardar o e-mail da conta (formato `eas-play-submit@dungeons-play-publish.iam.gserviceaccount.com`)

### 4. Dar permissão no Play Console
- [play.google.com/console](https://play.google.com/console) → **Usuários e permissões** → **Convidar novos usuários**
- Colar o e-mail da service account, dar acesso ao app **Dungeons & Fitness** com papel de **Gerenciador de versões de produção** (ou equivalente que permita enviar builds)
- Enviar convite — contas de serviço ficam ativas na hora, não precisam "aceitar"

### 5. Salvar a chave e rodar o submit
- Salvar o JSON em `frontend/credentials/` (pasta já protegida no `.gitignore`)
- Rodar de novo:
  ```powershell
  eas submit --platform android --profile production --latest
  ```
- Quando perguntar a credencial, escolher **"Upload a new service account key"** e apontar pro JSON novo (não escolher a chave do Firebase que já aparece na lista)

## Observações

- **Verificação de desenvolvedor Android** (banner novo do Play Console, prazo 30/09/2026): o pacote `dev.dungeons.fitness` já está **Registrado** (3 chaves) — nada pendente aí. A aba "Identidade" também já vem preenchida com os dados da conta (Forja Software). Não bloqueia o submit.
- Depois que o submit funcionar uma vez, o EAS salva essa credencial e os próximos `eas submit` não pedem de novo.

Relacionado: `PUSH_NOTIFICATIONS_SETUP.md` (o que motivou esse novo build), memória do projeto `project-playstore-launch-prep`.
