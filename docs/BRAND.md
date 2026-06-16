# Foome — Guia de Marca

> **Conceito:** *Foome = "fome" + "me". A fome que fala.*
> Imediato, pessoal, quente e com borda. Não é o delivery genérico e tímido —
> é a vontade de comer agora, com personalidade e bom humor.

## 1. Personalidade

- **Faminto e direto:** resolve a fome rápido, sem rodeio.
- **Pessoal:** fala com você no singular, como um amigo que conhece seu pedido.
- **Quente com atitude:** caloroso, mas confiante e ousado — nunca corporativo.
- **Bem-humorado, não bobo:** leveza com competência.

## 2. Cor

A paleta sai **de propósito** do laranja-clichê de delivery. A marca é construída
sobre um vermelho-coral quente ("Brasa") com um acento de lima elétrica ("Limão")
— a virada que torna o Foome memorável.

| Token | Hex (claro) | Hex (escuro) | Uso |
|---|---|---|---|
| `brand` (Brasa) | `#FF2E4D` | `#FF4D66` | cor principal: CTAs, marca, destaques |
| `brandDark` | `#DB1C39` | `#DB1C39` | pressed/contraste |
| `brandLight` | `#FFE7EB` | `#2C1419` | fundos suaves de marca |
| `accent` (Limão) | `#CDF564` | `#CDF564` | fagulha de energia, micro-destaques |
| `ink` | `#0A0A0A` | `#F0F0F0` | texto principal |

**Por que Brasa (#FF2E4D):** vermelho-coral é apetitoso e urgente (fome), porém o
tom levemente rosado o afasta tanto do laranja-comum quanto do vermelho-iFood —
fica moderno e próprio. **Por que Limão (#CDF564):** alta energia e contraste
complementar; usado com parcimônia (badges, fagulha do logo) cria assinatura.

A cor de marca é consumida via tema em runtime (`useTheme().C.brand`), então
funciona automaticamente em **claro e escuro** nas 21 telas.

## 3. Tipografia

- **Display (títulos):** Poppins — ExtraBold/Bold/SemiBold. Carrega a
  personalidade: redonda, confiante, amigável.
- **Texto (corpo/UI):** Inter — Regular→Bold. Neutra e altamente legível.
- **Mono (preços, códigos, tempos):** JetBrains Mono — dá precisão e "produto".

Tokens em `constants/theme.js` (`F`, `TYPE`).

## 4. Logo

**Conceito:** o símbolo é um **balão de fala** (a marca "fala" com você) em cor de
marca, com uma **mordida** recortada no canto (a "fome"), um **rostinho** (os
"oo" de Foome viram olhos + um sorriso) e uma **fagulha limão** na mordida.
Faminto, pessoal e simpático — não é um texto qualquer numa fonte.

- Componente: `components/Logo.js` (react-native-svg), **theme-aware** e escalável.
- Variações: `full` (símbolo + wordmark), `symbol` (isolado), `wordmark`.
- Aplicado em: **splash** (`App.js`), **login**, **onboarding** e **header da Home**.
- Asset vetorial: `assets/logo.svg`.

### Ícone do app / splash
- `app.json`: fundo do adaptive icon = `#FF2E4D` (Brasa); splash branco com o símbolo.
- Os PNGs (`assets/icon.png`, `adaptive-icon.png`, `splash-icon.png`) devem ser
  exportados a partir de `assets/logo.svg` (símbolo isolado, 1024×1024, fundo
  Brasa para o ícone). Ver `docs/DEMO.md` para o comando de export.

## 5. Ícones (sem emoji)

**Princípio inegociável: zero emoji** — em UI, texto ou comentário. Tudo usa
**lucide-react-native**, de forma intencional:
- Categorias de comida → `components/CategoriaIcone.js` (ícone lucide por categoria:
  Hambúrgueres→Sandwich, Pizzas→Pizza, Japonês→Fish, Mexicano→Flame,
  Saudável→Salad, Massas→Wheat, Churrasco→Beef, Açaí→Grape).
- UI geral → lucide via `components/Icon.js`.

## 6. Voz

- 1ª pessoa, próximo: "Bora matar a fome?", "A fome que fala."
- Frases curtas, ativas, com energia. Erros são honestos e gentis.
- Estados vazios convidam à ação, não culpam o usuário.
