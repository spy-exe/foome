# Foome — Guia de Demonstração / Entrega

Como subir tudo e rodar o app real (consumindo a API real) num device/emulador.

## 1. Subir o backend

A partir da raiz do repo:

```bash
docker compose up -d db api
```

- API: http://localhost:8000 · Swagger: http://localhost:8000/docs
- Sobe Postgres, aplica migrations e roda o seed (8 restaurantes). Idempotente.

Verifique:
```bash
curl http://localhost:8000/health        # {"status":"ok",...}
curl http://localhost:8000/restaurants    # 8 restaurantes
```

## 2. Apontar o app para o backend

O app lê `EXPO_PUBLIC_API_URL` (Expo). Defina conforme o alvo:

| Alvo | URL |
|---|---|
| Web / iOS Simulator | `http://localhost:8000` |
| Android emulator | `http://10.0.2.2:8000` |
| Device físico (mesma rede) | `http://SEU_IP_LAN:8000` (ex.: `http://192.168.0.10:8000`) |

Para desenvolvimento (Metro):
```bash
cp .env.example .env      # ajuste EXPO_PUBLIC_API_URL
npx expo start
```
> No **Expo Go** os recursos nativos (mapa, biometria, localização) não funcionam
> totalmente — para a demo completa use o **dev build / APK** (passo 3).

## 3. Gerar e instalar o APK (EAS)

Recursos nativos (biometria, `react-native-maps`, localização) exigem um build
standalone — **não rodam no Expo Go**. Os perfis estão em `eas.json`.

```bash
npm install -g eas-cli
eas login
eas init            # cria o projectId (grava em app.json > extra.eas.projectId)

# APK de preview (a URL da API vem do env do perfil em eas.json)
eas build -p android --profile preview
```
Baixe o APK pelo link do build e instale:
```bash
adb install foome.apk
```

### Mapa no Android (react-native-maps)
Para o mapa renderizar no APK Android, adicione sua chave do Google Maps em
`app.json`:
```json
"android": {
  "config": { "googleMaps": { "apiKey": "SUA_CHAVE" } }
}
```
(No iOS/Apple Maps não é necessário.)

### Ajustar a URL da API do build
Edite o `env.EXPO_PUBLIC_API_URL` do perfil em `eas.json` antes do build, ou use
o perfil `production` apontando para um backend hospedado.

## 4. Roteiro da demo (fluxo completo)

1. Onboarding → Cadastro/Login (senha; depois, biometria em *Perfil > Configurações*).
2. Home lista restaurantes **da API**, ordenados por proximidade (localização).
3. Abrir restaurante → menu **da API** → adicionar itens.
4. Carrinho → finalizar (biometria) → pedido criado no backend.
5. Pedidos → Acompanhar → status avança no servidor; ao ficar *a caminho*,
   aparece o **código de entrega** → confirmar → **entregue**.
6. Avaliar o pedido; alternar tema claro/escuro em Configurações.

## 5. Plano de contingência (backend remoto)

Se a máquina do avaliador não puder subir o Docker, exponha o backend local por
um túnel e aponte o app para ele:

```bash
# opção A: cloudflared
cloudflared tunnel --url http://localhost:8000
# opção B: ngrok
ngrok http 8000
```
Pegue a URL pública (`https://...`) e:
- rebuild com `EXPO_PUBLIC_API_URL=<url>` no `eas.json`, ou
- rode `EXPO_PUBLIC_API_URL=<url> npx expo start` para um teste rápido.

> O CORS do backend já está liberado (`*`), então o túnel funciona direto.

## 6. Testes

```bash
npm test                 # 41 testes (serviços, componentes, adapters)
maestro test .maestro/   # E2E (ver docs/MAESTRO.md; precisa de dev build)
```
