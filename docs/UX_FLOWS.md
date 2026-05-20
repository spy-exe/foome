# Fluxos de UX e Arquitetura de Navegação — Foome

> Mapeamento completo de todos os fluxos do app, incluindo happy paths,
> fluxos de retorno, fluxos de erro e hierarquia de informação por tela.

---

## Happy Path — Primeiro Uso

```
                    ┌──────────────────────┐
                    │      SplashScreen     │  2s
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Onboarding (Slide 1) │
                    │  "O Sul Fluminense... │
                    └──────────┬───────────┘
                               │ → swipe / "Começar"
                    ┌──────────▼───────────┐
                    │  Onboarding (Slide 2) │
                    │  "Rápido de verdade"  │
                    └──────────┬───────────┘
                               │ → swipe / "Continuar"
                    ┌──────────▼───────────┐
                    │  Onboarding (Slide 3) │
                    │  "Do pedido até sua   │
                    │   mesa"               │
                    └──────────┬───────────┘
                               │ → "Criar minha conta"
                    ┌──────────▼───────────┐
                    │  Cadastro - Etapa 1   │
                    │  (nome, email, senha) │
                    └──────────┬───────────┘
                               │ → "Continuar"
                    ┌──────────▼───────────┐
                    │  Cadastro - Etapa 2   │
                    │  (foto)               │
                    └──────────┬───────────┘
                               │ → "Continuar"
                    ┌──────────▼───────────┐
                    │  Cadastro - Etapa 3   │
                    │  (confirmação)        │
                    └──────────┬───────────┘
                               │ → "Criar conta"
                    ┌──────────▼───────────┐
                    │       HomeScreen      │  Login automático
                    │  saudação + ofertas   │
                    │  + perto de você      │
                    └──────────┬───────────┘
                               │ → toca restaurante
                    ┌──────────▼───────────┐
                    │   RestauranteScreen   │
                    │  cardápio em tabs     │
                    └──────────┬───────────┘
                               │ → toca produto
                    ┌──────────▼───────────┐
                    │ ProdutoDetalheScreen  │
                    │  tamanhos + adicionais│
                    └──────────┬───────────┘
                               │ → "Adicionar"
                    ┌──────────▼───────────┐
                    │   CarrinhoScreen      │
                    │  itens + cupom + total│
                    └──────────┬───────────┘
                               │ → "Confirmar pedido"
                    ┌──────────▼───────────┐
                    │   CheckoutScreen      │
                    │  endereço → pagamento │
                    │  → revisão            │
                    └──────────┬───────────┘
                               │ → "Confirmar pedido"
                    ┌──────────▼───────────┐
                    │  ConfirmacaoScreen    │
                    │  "Pedido confirmado!" │
                    └──────────┬───────────┘
                               │ → "Acompanhar pedido"
                    ┌──────────▼───────────┐
                    │ RastreamentoScreen    │
                    │  status: confirmado → │
                    │  preparando → saiu →  │
                    │  entregue             │
                    └──────────┬───────────┘
                               │ → entregue + timeout
                    ┌──────────▼───────────┐
                    │  Modal Avaliação      │
                    │  (1-5 estrelas)       │
                    └───────────────────────┘
```

---

## Happy Path — Retorno (Usuário com Conta)

```
                    ┌──────────────────────┐
                    │      SplashScreen     │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │     LoginScreen       │
                    │  biometria 1 toque    │
                    └──────────┬───────────┘
                               │ → autenticação
                    ┌──────────▼───────────┐
                    │     HomeScreen        │
                    │  personalizada        │
                    │  (histórico + ofertas)│
                    └──────────┬───────────┘
                               │ → FAB "Repetir último"
                    ┌──────────▼───────────┐
                    │   CarrinhoScreen      │
                    │  preenchido com       │
                    │  último pedido        │
                    └──────────┬───────────┘
                               │ → checkout direto
                    ┌──────────▼───────────┐
                    │   CheckoutScreen      │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  ConfirmacaoScreen    │
                    └───────────────────────┘
```

---

## Fluxo de Busca

```
      ┌──────────────────────────────────────────────────┐
      │                   HomeScreen                       │
      │  [🔍 Buscar restaurante ou prato...]               │
      └──────────────────┬────────────────────────────────┘
                         │ → foca input
      ┌──────────────────▼────────────────────────────────┐
      │                 BuscaScreen                        │
      │  - Histórico de buscas recentes                    │
      │  - (enquanto digita: debounce 300ms)               │
      └──────────────┬──────────────────┬─────────────────┘
                     │                  │
          ┌──────────▼──────────┐       │
          │  Resultados em      │       │ → toca filtros
          │  tempo real         │       │
          │  (lista de          │  ┌────▼────────────┐
          │  restaurantes +     │  │ BottomSheet     │
          │  pratos)            │  │ Filtros:        │
          └──────────┬──────────┘  │ • Categoria      │
                     │             │ • Faixa preço    │
                  toca             │ • Tempo entrega  │
               resultado           │ • Ordenar        │
                     │             └────┬────────────┘
                     │                  │ → "Aplicar"
                     │                  │
                     ▼                  ▼
             RestauranteScreen    BuscaScreen (filtrada)
```

---

## Fluxo de Erro — Sem Internet

```
                    ┌──────────────────────┐
                    │       HomeScreen      │
                    │  Detecção offline →   │
                    │  Banner persistente:  │
                    │  "Sem conexão —       │
                    │   mostrando dados     │
                    │   salvos."            │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Usuário tenta ação   │
                    │  que requer internet  │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Modal/Banner:       │
                    │  "Sem conexão.       │
                    │   Verifique seu      │
                    │   Wi-Fi ou dados     │
                    │   móveis."           │
                    │  [OK]                │
                    └──────────────────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Caso especial:      │
                    │  confirmar pedido    │
                    │  offline             │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Alert explicativo:  │
                    │  "Sem conexão. Seu   │
                    │   pedido não foi     │
                    │   perdido — ele      │
                    │   volta assim que    │
                    │   você estiver       │
                    │   online."           │
                    │  [Tentar novamente]  │
                    │  [Cancelar]          │
                    └──────────────────────┘
```

---

## Fluxo de Erro — Pagamento Recusado

```
      ┌──────────────────────────────────────────────────┐
      │               CheckoutScreen                      │
      │  Usuário → confirma pedido                        │
      │  → processa pagamento                             │
      │  → PAGAMENTO RECUSADO                             │
      └──────────────────┬────────────────────────────────┘
                         │
      ┌──────────────────▼────────────────────────────────┐
      │  Toast/Alert no Checkout:                          │
      │  "Pagamento não aprovado. Que tal tentar           │
      │   outro método?"                                   │
      │  [Trocar método de pagamento]                      │
      │  [Cancelar]                                        │
      └──────────────────┬────────────────────────────────┘
                         │ → "Trocar método"
                         │
      ┌──────────────────▼────────────────────────────────┐
      │  Seção de pagamento reaberta                       │
      │  Usuário seleciona novo método → confirma          │
      └──────────────────┬────────────────────────────────┘
                         │ → sucesso
      ┌──────────────────▼────────────────────────────────┐
      │           ConfirmacaoScreen                        │
      └───────────────────────────────────────────────────┘
```

---

## Fluxo de Favoritos

```
      ┌──────────────────────────────────────────────────┐
      │  RestauranteCard / RestauranteScreen              │
      │  ♥ (vazio) → toca                                │
      │  → animação de preenchimento                      │
      │  → salva no AsyncStorage                          │
      │  ♥ (preenchido) → toca                           │
      │  → remove                                        │
      └──────────────────┬────────────────────────────────┘
                         │
      ┌──────────────────▼────────────────────────────────┐
      │  Perfil → Favoritos                                │
      │  Grid de restaurantes salvos                       │
      │  Cada card: ♥ preenchido + nome + tempo            │
      │  Toca → RestauranteScreen                          │
      └───────────────────────────────────────────────────┘
```

---

## Fluxo de Repetir Pedido

```
      ┌──────────────────────────────────────────────────┐
      │  PedidosScreen (Histórico)                        │
      │  Card do pedido → [Repetir]                       │
      └──────────────────┬────────────────────────────────┘
                         │
      ┌──────────────────▼────────────────────────────────┐
      │  CarrinhoScreen (pré-preenchido)                  │
      │  "Último pedido do {restaurante}. Confira         │
      │   antes de confirmar."                            │
      │  Itens iguais ao último pedido                    │
      └──────────────────┬────────────────────────────────┘
                         │ → edição opcional → confirmar
      ┌──────────────────▼────────────────────────────────┐
      │  CheckoutScreen → ConfirmacaoScreen               │
      └───────────────────────────────────────────────────┘
```

---

## Fluxo de Onboarding Pulado

```
      ┌──────────────────────────────────────────────────┐
      │  SplashScreen                                     │
      └──────────────────┬────────────────────────────────┘
                         │
      ┌──────────────────▼────────────────────────────────┐
      │  Onboarding (Slide 1)                             │
      │  → [Já conheço]                                   │
      └──────────────────┬────────────────────────────────┘
                         │
      ┌──────────────────▼────────────────────────────────┐
      │  LoginScreen                                      │
      │  (se já tem conta → login)                        │
      │  (ou → CadastroScreen)                            │
      └───────────────────────────────────────────────────┘
```

---

## Fluxo de Recuperação de Senha

```
      ┌──────────────────────────────────────────────────┐
      │  LoginScreen                                      │
      │  → [Esqueci minha senha]                          │
      └──────────────────┬────────────────────────────────┘
                         │
      ┌──────────────────▼────────────────────────────────┐
      │  RecuperarSenhaScreen                             │
      │  Email → [Enviar link]                            │
      │  → Confirmação: "Email enviado!"                  │
      │  → Abre email app (via linking)                   │
      └───────────────────────────────────────────────────┘
```

---

## Fluxo de Avaliação Pós-Entrega

```
      ┌──────────────────────────────────────────────────┐
      │  RastreamentoScreen (entregue)                    │
      │  → após 30s, modal aparece                        │
      └──────────────────┬────────────────────────────────┘
                         │
      ┌──────────────────▼────────────────────────────────┐
      │  ModalAvaliacao                                   │
      │  1-5 estrelas + comentário                        │
      │  → [Enviar avaliação]                             │
      │  → "Avaliação enviada!"                           │
      └───────────────────────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
    Volta ao Rastreamento     DetalhePedidoScreen
    (fechado)                 (com avaliação visível)
```

---

## Mapa de Navegação (Router)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            Tab Navigator (Bottom)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Home    │  │  Busca   │  │ Pedidos  │  │ Favoritos│  │  Perfil  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
└───────┼──────────────┼────────────┼──────────────┼──────────────┼────────┘
        │              │            │              │              │
        ▼              ▼            ▼              ▼              ▼
  Restaurante     (Busca por     Pedidos        Favoritos      Perfil
  Screen          nome/filtro)   (em andamento  (grid de       (endereços,
        │                       / histórico)     restaurantes)  config,
        ▼                        │                              ajuda)
  Produto              ┌─────────┴──────────┐
  Detalhe              │                    │
        ▼              ▼                    ▼
  Carrinho       Detalhe               Avaliacao
        ▼        Pedido                (modal)
  Checkout          │
        ▼           ▼
  Confirmacao  (repetir →
        ▼      Carrinho)
  Rastreamento
  (Mapa)
        ▼
  Avaliacao (modal)

───────────────────────────────────────────────────────────────────────────
                     Stack Navigator (Auth)
───────────────────────────────────────────────────────────────────────────
  Splash → Onboarding → Cadastro → Login → (Tab Navigator)
                                               ↑
                                         RecuperarSenha
```

---

## Hierarquia de Informação por Tela

Para cada tela principal, ordem de atenção visual (1º = mais importante).

### HomeScreen
| Ordem | Elemento | Justificativa |
|-------|----------|---------------|
| 1º | Saudação + nome | Identificação e personalização |
| 2º | Ofertas relâmpago | Conversão por urgência |
| 3º | Seções de restaurantes | Navegação e descoberta |
| — | Busca no header | Utilitário de suporte |

### RestauranteScreen
| Ordem | Elemento | Justificativa |
|-------|----------|---------------|
| 1º | Informações: nome, badge, tempo, taxa | Decisão de continuar |
| 2º | Tabs do cardápio | Navegação principal |
| 3º | Lista de produtos | Ação principal |
| — | Carrinho flutuante | Suporte (visível só com itens) |

### ProdutoDetalheScreen
| Ordem | Elemento | Justificativa |
|-------|----------|---------------|
| 1º | Nome + foto + preço base | Decisão de compra |
| 2º | Tamanhos | Primeira escolha obrigatória |
| 3º | Adicionais | Upsell |
| 4º | CTA "Adicionar" | Conversão |

### CarrinhoScreen
| Ordem | Elemento | Justificativa |
|-------|----------|---------------|
| 1º | Lista de itens com preço | Revisão do que vai pagar |
| 2º | Total + taxa | Transparência de valor |
| 3º | Cupom de desconto | Estímulo a engajamento |
| 4º | CTA "Confirmar pedido" | Conversão |

### CheckoutScreen
| Ordem | Elemento | Justificativa |
|-------|----------|---------------|
| 1º | Endereço de entrega | Onde vai chegar |
| 2º | Método de pagamento | Como vai pagar |
| 3º | Revisão do pedido | Confirmação final |
| 4º | CTA "Confirmar pedido" | Conversão |

### RastreamentoScreen
| Ordem | Elemento | Justificativa |
|-------|----------|---------------|
| 1º | Status timeline | Onde está o pedido agora |
| 2º | Tempo restante | Ansiedade do usuário |
| 3º | Mapa (quando saiu) | Visualização da entrega |
| 4º | Nome do entregador | Conexão pessoal |

### PerfilScreen
| Ordem | Elemento | Justificativa |
|-------|----------|---------------|
| 1º | Stats (pedidos, gastos, restaurantes) | Engajamento e fidelidade |
| 2º | Menu de seções | Navegação |
| 3º | Dados do usuário | Identificação |

---

## Notas de Transição entre Telas

| Transição | Tipo de animação | Duração |
|-----------|------------------|---------|
| Splash → Onboarding | Crossfade | 500ms |
| Onboarding entre slides | Slide horizontal | 300ms |
| Onboarding → Cadastro | Slide-up | 400ms |
| Cadastro entre etapas | Slide horizontal | 300ms |
| Cadastro → Home | Crossfade + scale | 500ms |
| Home → Restaurante | Slide-up com zoom | 350ms |
| ProdutoDetalhe → Carrinho | Modal bottom-sheet | 300ms |
| Carrinho → Checkout | Slide horizontal | 300ms |
| Checkout → Confirmação | Crossfade com confete | 600ms |
| Confirmação → Rastreamento | Slide horizontal | 300ms |
| Modal Avaliação | Bottom-sheet | 250ms |
| Home → Busca | Foco no SearchBar | 200ms |
