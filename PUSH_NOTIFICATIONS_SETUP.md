# Push Notifications — estado e o que falta

> Levantado em 2026-09-05. **Push NÃO funciona no build Android atual** — falta configurar o FCM.

## Diagnóstico

No logcat do build de teste (`versionCode 2`) aparece, ao abrir o app:

```
W ReactNativeJS: 'Falha ao obter push token:',
  [Error: Make sure to complete the guide at https://docs.expo.dev/push-notifications/fcm-credentials/
   : Default FirebaseApp is not initialized in this process dev.dungeons.fitness.]
  code: 'E_REGISTRATION_FAILED'
```

Causa: **não existe `google-services.json`** no projeto, nem `android.googleServicesFile` no `app.json`, nem credencial **FCM V1** no projeto EAS.

Consequência em cadeia:
1. `frontend/src/lib/notifications.ts` → `getExpoPushTokenAsync()` lança `E_REGISTRATION_FAILED`
2. `obterPushToken()` retorna `null`
3. `frontend/src/app/_layout.tsx` / `settings.tsx` nunca chamam `atualizarPushTokenMutation` com um token válido
4. `users.pushToken` fica `null` no banco
5. Backend (`backend/src/lib/push.ts` → `enviarPush`) filtra tokens inválidos → nenhum push é enviado

O sino in-app (`notifications` no banco, tela `notifications.tsx`) **funciona** — só o push remoto que não.

## Arquivos envolvidos

- `frontend/src/lib/notifications.ts` — pega permissão + Expo push token
- `frontend/src/app/_layout.tsx` (~linha 54) — registra o token no login
- `frontend/src/app/(tabs)/profile/settings.tsx` — toggle de notificações (seta/limpa `pushToken`)
- `frontend/app.json` — plugin `expo-notifications` já está; falta `android.googleServicesFile`
- `backend/src/lib/push.ts` — envio via `expo-server-sdk` (Expo Push API)
- `backend/src/modules/notificacoes/notificacoes.service.ts` — `notificar` / `notificarEmLote`
- Jobs que disparam push: `backend/src/jobs/streak-lembrete.ts` (20h), missões novas, conquistas, convites de guilda

## Checklist — Android (FCM), fazer uma vez

- [ ] **Firebase Console** → criar projeto (ou reusar) → *Adicionar app* → Android
  - Package name: `dev.dungeons.fitness`
  - Baixar `google-services.json`
- [ ] Colocar `google-services.json` em `frontend/` (adicionar a `.gitignore` — contém IDs do projeto, não é segredo forte mas evita ruído; EAS lê do repo, então se for gitignored precisa de `.easignore` ajustado OU commitar mesmo)
- [ ] `frontend/app.json` → dentro de `"android"`:
  ```json
  "googleServicesFile": "./google-services.json"
  ```
- [ ] **FCM V1**: Firebase → Configurações do projeto → *Contas de serviço* → *Gerar nova chave privada* (baixa um JSON)
- [ ] Subir pro EAS: `eas credentials` → plataforma Android → *Push Notifications: Manage your FCM V1 service account key* → *Upload* (aponta pro JSON da conta de serviço)
- [ ] `eas build -p android --profile preview` (rebuild — o `google-services.json` precisa entrar no binário)
- [ ] Abrir o app no device, ativar notificações em *Perfil → Configurações*, confirmar que `users.pushToken` foi salvo (`ExponentPushToken[...]`)

## Checklist — iOS (APNs)

- [ ] Menos trabalho: o EAS gera a APNs key durante `eas build -p ios` usando a conta Apple já configurada (ver `IOS_TESTFLIGHT.md`, Team ID `87QC6XXC78`)
- [ ] `expo-notifications` já cuida do `aps-environment` entitlement
- [ ] Testar em device real (push não funciona no Simulador)

## Testar "fora do app"

Depois que houver um `ExponentPushToken[...]` válido salvo:

**curl:**
```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{"to":"ExponentPushToken[XXXX]","title":"Teste","body":"Funciona!","sound":"default"}'
```

**Web:** https://expo.dev/notifications — cola o token, escreve título/corpo, envia.

**Achar o token:**
- Log temporário no `_layout.tsx` (`console.log(pushToken)`), ou
- `SELECT username, push_token FROM users WHERE push_token IS NOT NULL;` no banco (Railway)

## Observações

- Expo Go (SDK 53+) não suporta mais push remoto — precisa de dev/preview build (já é o caso aqui).
- `Notifications.scheduleNotificationAsync` dispara notificação **local** sem servidor nem FCM — serve pra testar UI/handler, mas não é push "de fora".
