# Testes E2E com Maestro

Os flows ficam em `.maestro/` e exercitam os fluxos críticos do Foome contra o
**app real consumindo a API real**.

## Pré-requisitos

1. **Maestro CLI** instalado:
   ```bash
   curl -fsSL "https://get.maestro.mobile.dev" | bash
   ```
2. **Backend no ar** (a partir da raiz do repo):
   ```bash
   docker compose up -d db api
   ```
3. **App instalado** num emulador/dispositivo:
   - Maestro **não roda no Expo Go** — use um **dev build / APK** (ver `docs/DEMO.md`).
   - O app precisa apontar para o backend via `EXPO_PUBLIC_API_URL`.
4. Para o flow de **pedido/entrega**: o emulador precisa de **biometria cadastrada**
   (Android: *Settings > Security > Fingerprint*; iOS Simulator: *Features > Face ID > Enrolled*).

## Rodar

```bash
# Todos os flows
maestro test .maestro/

# Um flow específico, passando variáveis
maestro test .maestro/flow-auth.yaml \
  -e EMAIL=maestro@foome.app -e SENHA=senha123 -e NOME="Maestro Tester"

# Rastreamento precisa do código de entrega exibido na tela
maestro test .maestro/flow-track.yaml -e DELIVERY_CODE=1234
```

## Flows

| Arquivo | Cobre |
|---|---|
| `flow-auth.yaml` | cadastro → entra autenticado → logout → login |
| `flow-browse.yaml` | listar restaurantes (API), filtrar por categoria, abrir loja, mapa |
| `flow-order.yaml` | abrir loja → adicionar ao carrinho → finalizar (até a biometria) |
| `flow-track.yaml` | acompanhar pedido → confirmar entrega com o `delivery_code` |
| `flow-profile.yaml` | abrir configurações → trocar tema → (excluir conta, opcional) |

## Inventário de testIDs

Padrão de nomenclatura: `tipo-acao[-id]` (kebab-case).

- **Tabs:** `tab-inicio`, `tab-mapa`, `tab-pedidos`, `tab-perfil`
- **Auth:** `input-email`, `input-senha`, `input-nome`, `btn-entrar`, `btn-cadastrar`, `link-cadastro`
- **Catálogo:** `input-busca`, `card-restaurant-{id}`, `card-produto-{id}`, `btn-add-cart`, `btn-ver-carrinho`
- **Pedido:** `btn-finalizar` (carrinho), `btn-continuar` / `btn-confirmar` (checkout)
- **Entrega:** `input-delivery-code`, `btn-confirm-delivery`
- **Perfil/Config:** `btn-logout`, `switch-tema`, `switch-biometria`, `btn-excluir-conta`

## Observações

- **Biometria** (finalizar pedido e login por biometria): Maestro lida com o
  diálogo do sistema quando há biometria cadastrada no emulador; sem isso, o
  fluxo para na confirmação.
- **`delivery_code`**: é gerado no backend e mostrado na tela de rastreamento
  quando o pedido fica *a caminho*. Em automação, leia-o da UI ou injete via env.
- Os flows usam `runFlow ... when` para pular o login quando o usuário já está
  autenticado e para pular o onboarding na primeira execução.
