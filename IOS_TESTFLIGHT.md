# Build de teste iOS (TestFlight) — passo a passo

Status em 2026-09-02: config do projeto pronta, falta rodar o build.
Não precisa de Mac — build e submit rodam na nuvem do EAS.

## Dados da conta Apple (cliente)

| Item | Valor |
|---|---|
| Entidade | Forja Software Inova Simples (I.S.) — conta de Organização |
| Titular | Ronald Geisteira de Moura |
| Team ID | `87QC6XXC78` |
| Bundle ID (iOS) | `dev.dungeons.fitness` |
| API Key ID | `WYKVKK2KM5` |
| API Issuer ID | `137d59e7-211d-40cb-aff1-0cc8c1497202` |
| Acesso da key | Gerente de apps (App Manager) |

Acesso: `naellyvitoria8@gmail.com` é **Administrador** no time. 2FA do Apple ID
ativo por SMS (não precisa de iPhone).

## Já configurado no repo

- `app.json`: `ios.bundleIdentifier = dev.dungeons.fitness`,
  `ios.config.usesNonExemptEncryption = false`
- `eas.json`: bloco `submit.production.ios` com a API key + `appleTeamId`
- `plugins/withHealthKit.js`: entitlement HealthKit + `NSHealthShareUsageDescription`
  (só leitura de passos/distância/FC)

## O que falta fazer

### 1. Salvar o arquivo .p8

Baixado do App Store Connect (Users and Access → Integrations → API do App Store
Connect). Só dá pra baixar **uma vez**. Salvar em:

```
frontend/credentials/AuthKey_WYKVKK2KM5.p8
```

`.gitignore` já ignora `*.p8`, então não vai pro git.

Se o `.p8` foi perdido: revogar a key no App Store Connect e gerar outra
(atualizar Key ID / caminho no `eas.json`).

### 2. Definir as variáveis de ambiente (PowerShell)

```powershell
cd c:\Dev\dungeons\frontend
$env:EXPO_ASC_API_KEY_PATH = "c:\Dev\dungeons\frontend\credentials\AuthKey_WYKVKK2KM5.p8"
$env:EXPO_ASC_KEY_ID = "WYKVKK2KM5"
$env:EXPO_ASC_ISSUER_ID = "137d59e7-211d-40cb-aff1-0cc8c1497202"
```

Assim o `eas build` usa a API key e não pede login/2FA do Apple ID.

### 3. Build

```powershell
eas build --platform ios --profile production
```

Na primeira vez o EAS:
- registra o bundle ID `dev.dungeons.fitness` na conta Apple
- cria o Distribution Certificate e o Provisioning Profile (App Store)
- roda o build na nuvem (~15-25 min)

### 4. Enviar pro TestFlight

```powershell
eas submit --platform ios --profile production --latest
```

Se o app ainda não existir no App Store Connect, responder **sim** pra criar.
O build aparece em TestFlight depois de ~5-30 min de "Processing".

### 5. Configurar TestFlight

- **Teste interno**: TestFlight → Internal Testing → adicionar testers (precisam
  estar em Users and Access). Libera na hora, sem revisão.
- **Teste externo** (link pra qualquer pessoa, até 10.000): precisa de
  **Beta App Review** (~1 dia) no primeiro build. Preencher *Test Information*:
  - email de feedback
  - o que testar
  - **conta demo** (email + senha) — o app tem login
  - nota sobre HealthKit: "o app lê passos, distância e frequência cardíaca
    apenas para sincronizar o progresso do usuário"

## Gotchas

- Ícone iOS (`assets/icon.png`) precisa ser 1024x1024 **sem canal alfa**.
- Export compliance: já resolvido com `usesNonExemptEncryption: false`.
- App ID precisa da capability HealthKit habilitada — o EAS costuma habilitar
  junto com as credenciais; se reclamar, marcar manual no developer portal
  (Identifiers → o App ID → HealthKit).
- Deploy do backend é manual (`railway up`) — ver memória do projeto.
