# Foome Design System

## Filosofia

Rápido, honesto, direto. O design system do Foome foi construído para transmitir confiança e agilidade — sem excessos visuais, sem atrito. Cores quentes com base midnight, tipografia funcional com três famílias de fonte, ícones consistentes via Lucide.

---

## Paleta de Cores

### Brand
| Token | Hex | Uso |
|-------|-----|-----|
| `C.brand` | `#E8452C` | Botões primários, links, destaques |
| `C.brandDark` | `#C73520` | Hover / pressed states |
| `C.brandLight` | `#FFF0ED` | Backgrounds sutis de brand |

### Base
| Token | Hex | Uso |
|-------|-----|-----|
| `C.ink` | `#0A0A0A` | Texto principal |
| `C.inkMid` | `#3D3D3D` | Texto secundário |
| `C.inkLight` | `#8A8A8A` | Placeholder, captions |

### Midnight (dark UI)
| Token | Hex | Uso |
|-------|-----|-----|
| `C.midnight` | `#1A1A2E` | Tab bar, cards escuros, footers |
| `C.midnightMid` | `#2D2D4E` | Elementos midnight elevados |
| `C.midnightLight` | `#E8E8F0` | Texto claro em fundo escuro |

### Superfícies
| Token | Hex | Uso |
|-------|-----|-----|
| `C.white` | `#FFFFFF` | Background principal |
| `C.offWhite` | `#F5F5F0` | Background alternativo |
| `C.surface` | `#FFFFFF` | Cartões, modais |
| `C.surfaceAlt` | `#F0F0EB` | Skeleton, áreas secundárias |
| `C.border` | `#E8E8E4` | Bordas padrão |
| `C.borderDark` | `#D0D0CC` | Bordas em destaque |

### Semânticas
| Token | Hex | Uso |
|-------|-----|-----|
| `C.success` | `#16A34A` | Confirmações, frete grátis |
| `C.successLight` | `#DCFCE7` | Background de confirmação |
| `C.warning` | `#D97706` | Estrelas, alertas |
| `C.warningLight` | `#FEF3C7` | Background de estrelas |
| `C.error` | `#DC2626` | Erros, validação |
| `C.errorLight` | `#FEE2E2` | Background de erro |
| `C.info` | `#2563EB` | Informação |
| `C.infoLight` | `#EFF6FF` | Background informativo |

---

## Tipografia

### Famílias

| Família | Uso | Pesos |
|---------|-----|-------|
| **Inter** | UI, labels, botões, navegação | 400, 500, 600, 700 |
| **Noto Sans** | Corpo, descrições | 400, 500, 600, 700 |
| **JetBrains Mono** | Números (preço, rating, tempo) | 400, 500, 700 |

### Regra fundamental
**JetBrains Mono é obrigatório para qualquer número.** Preço, rating, tempo de entrega, distância, contadores — tudo em JetBrains Mono. Nunca use Inter ou Noto Sans para números.

### Escala tipográfica

```javascript
TYPE.hero    // 32/40 — Inter Bold
TYPE.h1      // 26/34 — Inter Bold
TYPE.h2      // 22/30 — Inter SemiBold
TYPE.h3      // 18/26 — Inter SemiBold
TYPE.h4      // 16/24 — Inter Medium
TYPE.body    // 15/23 — Noto Sans Regular
TYPE.bodyS   // 14/21 — Noto Sans Regular
TYPE.caption // 12/18 — Inter Regular
TYPE.price   // 18/24 — JetBrains Mono Bold, brand
TYPE.priceS  // 15/21 — JetBrains Mono Medium
TYPE.priceLg // 24/32 — JetBrains Mono Bold, brand
TYPE.rating  // 13/18 — JetBrains Mono Medium
TYPE.time    // 13/18 — JetBrains Mono Regular
TYPE.badge   // 11/16 — JetBrains Mono Bold
```

---

## Ícones

**Lucide React Native** é a única fonte de ícones. Nunca use emoji como ícone de UI (emoji é aceitável apenas em dados de conteúdo, como emoji de produto).

### Mapa de ícones (constants/icons.js)

| Contexto | Ícones |
|----------|--------|
| Tabs | Home, Compass, ShoppingBag, User |
| Busca | Search, Filter, SlidersHorizontal |
| Localização | MapPin, Map, Navigation |
| Restaurante | Star, Clock, Truck, ChefHat |
| Perfil | Heart, Bell, Settings, HelpCircle |
| Ações | Plus, Minus, Trash2, Pencil |
| Pagamento | Tag, CreditCard, Wallet, QrCode |
| Status | Package, CheckCircle2, AlertCircle |

```javascript
export const ICON_SIZE = { xs: 14, sm: 16, md: 20, lg: 24, xl: 32 };
export const ICON_COLOR_DEFAULT = '#0A0A0A'; // C.ink
```

---

## Spacing

| Token | Pixels |
|-------|--------|
| `S.xs` | 4 |
| `S.sm` | 8 |
| `S.md` | 12 |
| `S.lg` | 16 |
| `S.xl` | 24 |
| `S.xxl` | 32 |
| `S.xxxl` | 48 |

---

## Border Radius

| Token | Pixels | Uso |
|-------|--------|-----|
| `R.sm` | 8 | Inputs, badges pequenos |
| `R.md` | 12 | Input fields, tabs |
| `R.lg` | 16 | Botões, cards de produto |
| `R.xl` | 20 | Cartões de restaurante |
| `R.xxl` | 28 | Modais, bottom sheets |
| `R.full` | 9999 | Badges circulares, avatares |

---

## Sombras

```javascript
SHADOW.card   // Cartões — elevacao suave (elevation 3)
SHADOW.float  // Elementos flutuantes — FAB, toasts (elevation 8)
SHADOW.sheet  // Bottom sheets — sombra superior (elevation 10)
```

---

## Catálogo de Componentes

### PrimaryButton
- `variant`: `"brand"` (default), `"midnight"`, `"outline"`
- Altura 52px, border radius `R.lg`
- Loading: `ActivityIndicator`
- Disabled: opacity 0.5

```jsx
<PrimaryButton label="Continuar" onPress={handlePress} />
<PrimaryButton label="Salvar" variant="midnight" />
<PrimaryButton label="Cancelar" variant="outline" />
```

### InputField
- Label opcional, foco com borda `C.midnight`
- Erro com borda `C.error` + mensagem abaixo
- Ícone Lucide opcional à esquerda
- Altura 52px, border radius `R.md`

```jsx
<InputField
  label="Email"
  placeholder="seu@email.com"
  icon={<Mail size={16} color={C.inkLight} />}
  erro="Email inválido"
/>
```

### RestauranteCard
- Gradiente `midnight → cor da categoria` no topo (140px)
- Ícone Lucide centralizado no gradiente
- Badge "POPULAR" quando avaliação ≥ 4.8
- Rating com `Star` Lucide e número em JetBrains Mono
- Tempo com `Clock` Lucide e número em JetBrains Mono
- Frete grátis destacado em `C.success`

### Stepper
- Zero state: botão `+` circular, fundo `C.brand`
- Active state: fundo `C.midnight`, botões `–` `+` brancos
- Número em `F.monoBold` com animação de slide vertical

### Toast
- Fundo escuro: `C.success` / `C.error` / `C.info` conforme tipo
- Ícone Lucide + texto branco
- Botão `X` para fechar
- Slide-in de cima, auto-dismiss 3s
- `SHADOW.float`

### SkeletonLoader
- Background `C.surfaceAlt`
- Shimmer animado entre opacidade 0.3 e 0.7
- Props: `width`, `height`, `borderRadius`

### EmptyState
- Ícone Lucide (prop `icon`, default `Package`) 48px
- Título + subtítulo opcional
- CTA opcional com `PrimaryButton variant="outline"`

### Badge
- Fundo `C.brand` (customizável via prop `cor`)
- Texto em `F.monoBold` 11px
- Border radius `R.full`
- Animação de escala ao mudar valor

### Avatar
- `tamanho`: `sm`(32), `md`(44), `lg`(64), `xl`(80)
- Foto ou iniciais sobre fundo `C.midnight`
- Fallback com ícone `User` Lucide

### RatingStars
- Estrelas `Star` Lucide preenchidas/vazias
- Valor numérico em `F.monoMedium` ao lado
- Cor das estrelas: `C.warning`

---

## Convenções

1. **JetBrains Mono** para todo número: preço, rating, tempo, distância, contagem
2. **Lucide** para todo ícone — zero emoji em UI
3. **Inter** para labels, botões e navegação
4. **Noto Sans** para corpo de texto e descrições
5. Spacing via tokens `S.*` — sem valores hardcoded
6. Border radius via tokens `R.*` — sem valores hardcoded
7. Sombras via objetos `SHADOW.*`
8. Inferface limpa, sem enfeites — "rápido, honesto, direto"
