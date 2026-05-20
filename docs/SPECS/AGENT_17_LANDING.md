# AGENT 17 — Landing Page + Docker
## Foome — Spec de Desenvolvimento

### Contexto

O Foome não tem presença web — apenas o app React Native. Para a apresentação do projeto (feira acadêmica, banca, portfólio), uma landing page profissional agrega muito valor.

A landing page deve:
- Apresentar o Foome como produto
- Ser visualmente alinhada ao tema do app (brand `#E8452C`, fontes Inter + Poppins)
- Ser 100% responsiva (mobile-first)
- Suportar dark mode nativo (preferência do sistema)
- Ter animações de scroll e micro-interações de alta qualidade
- Ser containerizada com Docker para deploy fácil

### Objetivo

1. Scaffoldar projeto Next.js 14 com App Router + TypeScript + Tailwind CSS dentro de `landing/`
2. Implementar 6 seções: Hero, Features, Como Funciona, Screenshots, Download, Footer
3. Animações com Framer Motion (scroll-triggered, stagger children, gestos)
4. Dark mode com `next-themes` (respeita `prefers-color-scheme`, toggle manual)
5. Fontes Inter + Poppins via `next/font` (sem Google Fonts CDN externo)
6. Docker multi-stage (build Next.js → runtime Node.js) + docker-compose

### Git Workflow

```bash
git checkout main
git pull origin main
git checkout -b feat/agent-17-landing

git add .
git commit -m "feat(landing): scaffoldar Next.js 14 com App Router e Tailwind"
# feat(landing): implementar seções Hero, Features e Como Funciona
# feat(landing): adicionar carrossel de screenshots e seção Download
# feat(landing): integrar next-themes para dark mode
# chore(docker): configurar Dockerfile multi-stage e docker-compose

git push origin feat/agent-17-landing
```

**Regras:**
- Mínimo 3 commits
- Nunca commitar direto na `main`
- Nunca fazer push forçado
- Usar conventional commits: `feat(landing):`, `chore(docker):`, `style(landing):`

### Arquivos a Modificar / Criar

O projeto Next.js será scaffoldado **dentro da pasta `landing/`** na raiz do repositório Foome. Ele é completamente independente do app React Native — sem compartilhar `node_modules`, `package.json` ou `tsconfig.json`.

#### Estrutura de diretórios esperada

```
Foome-Final/
├── landing/                          # ← NOVO: projeto Next.js 14
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── Dockerfile
│   ├── README_LANDING.md
│   ├── public/
│   │   └── mockups/                  # placeholders de screenshot
│   └── src/
│       ├── app/
│       │   ├── layout.tsx            # RootLayout: next-themes + next/font
│       │   ├── page.tsx              # HomePage (monta as seções)
│       │   └── globals.css           # Tailwind directives + custom theme
│       ├── components/
│       │   ├── Navbar.tsx            # Navbar fixa com glass effect + toggle dark mode
│       │   ├── Hero.tsx              # Hero animado com Framer Motion
│       │   ├── Features.tsx          # Grid de cards com scroll animation
│       │   ├── ComoFunciona.tsx      # 3 passos sequenciais
│       │   ├── Screenshots.tsx       # Carrossel de screenshots do app
│       │   ├── Download.tsx          # Badges App Store / Google Play (mock)
│       │   └── Footer.tsx            # Rodapé
│       └── lib/
│           └── theme.ts              # Cores, fontes e tokens do design system
├── docker-compose.yml                # MODIFICAR: apontar para landing/
└── ...
```

---

#### PASSO 1 — Scaffold do projeto

```bash
cd landing/
npx create-next-app@14 . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
```

**Nota:** Se o comando interativo falhar, crie manualmente com `npm init -y` e instale as dependências:

```bash
cd landing/
npm init -y
npm install next@14 react@^18 react-dom@^18
npm install -D typescript @types/react @types/node tailwindcss postcss autoprefixer
npm install next-themes framer-motion
npx tsc --init --jsx preserve
```

#### Dependências exatas

```json
{
  "name": "foome-landing",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.35",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "framer-motion": "^11.0.0",
    "next-themes": "^0.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

#### NOVO: `landing/src/lib/theme.ts`

Tokens de design alinhados ao `constants/theme.js` do app:

```ts
export const theme = {
  colors: {
    brand:       '#E8452C',
    brandDark:   '#C23525',
    brandLight:  '#FFF0EE',
    brandBorder: '#FBD0CB',

    ink:         '#17172B',
    ink2:        '#4A4A6A',
    ink3:        '#9494B2',
    ink4:        '#C8C8DC',

    bg:          '#F5F5FA',
    surface:     '#FFFFFF',
    border:      '#E8E8F0',

    amber:       '#FF9B3D',
    amberLight:  '#FFF4E8',
    teal:        '#00BE99',
    tealLight:   '#E6FAF6',
  },

  darkColors: {
    brand:       '#E8452C',
    brandDark:   '#C23525',
    brandLight:  '#2A1513',
    brandBorder: '#4A2020',

    ink:         '#F0F0F7',
    ink2:        '#C8C8DC',
    ink3:        '#9494B2',
    ink4:        '#6A6A82',

    bg:          '#12121A',
    surface:     '#1E1E2A',
    border:      '#2A2A3A',

    amber:       '#FF9B3D',
    amberLight:  '#2A2018',
    teal:        '#00BE99',
    tealLight:   '#182A24',
  },
} as const;

export type ThemeColors = typeof theme.colors;
```

---

#### NOVO: `landing/tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss';
import { theme } from './src/lib/theme';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: theme.colors.brand,
          dark: theme.colors.brandDark,
          light: theme.colors.brandLight,
          border: theme.colors.brandBorder,
        },
        ink: {
          DEFAULT: theme.colors.ink,
          2: theme.colors.ink2,
          3: theme.colors.ink3,
          4: theme.colors.ink4,
        },
        surface: {
          bg: theme.colors.bg,
          DEFAULT: theme.colors.surface,
          border: theme.colors.border,
        },
        accent: {
          amber: theme.colors.amber,
          'amber-light': theme.colors.amberLight,
          teal: theme.colors.teal,
          'teal-light': theme.colors.tealLight,
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '28px',
        full: '9999px',
      },
      animation: {
        'fade-in':   'fadeIn 0.6s ease-out',
        'slide-up':  'slideUp 0.6s ease-out',
        shimmer:     'shimmer 2s infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float':     'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.3' },
          '50%':      { opacity: '0.7' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

#### NOVO: `landing/src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply box-border;
  }

  html {
    @apply scroll-smooth antialiased;
  }

  body {
    @apply bg-white text-ink dark:bg-[#12121A] dark:text-[#F0F0F7];
  }
}

@layer components {
  .container-page {
    @apply mx-auto max-w-[1100px] px-6;
  }

  .section-padding {
    @apply py-20 md:py-28;
  }

  .glass {
    @apply bg-white/90 backdrop-blur-md border-b border-surface-border
           dark:bg-[#1E1E2A]/90 dark:border-[#2A2A3A];
  }

  .btn-primary {
    @apply inline-flex items-center justify-center gap-2
           bg-brand text-white font-heading font-bold
           px-8 py-3.5 rounded-lg
           shadow-lg shadow-brand/25
           hover:shadow-xl hover:shadow-brand/30
           hover:-translate-y-0.5
           transition-all duration-200
           text-base;
  }

  .btn-secondary {
    @apply inline-flex items-center justify-center gap-2
           bg-transparent text-ink dark:text-[#F0F0F7]
           border-2 border-surface-border dark:border-[#2A2A3A]
           font-heading font-bold
           px-8 py-3.5 rounded-lg
           hover:border-brand hover:text-brand
           transition-all duration-200
           text-base;
  }

  .section-tag {
    @apply inline-block bg-brand-light dark:bg-[#2A1513]
           text-brand font-semibold
           text-xs tracking-wider uppercase
           px-4 py-1.5 rounded-full
           mb-3;
  }

  .section-title {
    @apply font-heading font-bold text-3xl md:text-4xl lg:text-5xl
           text-ink dark:text-[#F0F0F7]
           tracking-tight leading-tight
           mb-3;
  }

  .section-subtitle {
    @apply text-ink-3 dark:text-[#9494B2]
           text-base md:text-lg
           max-w-lg mx-auto;
  }

  .card {
    @apply bg-[#F5F5FA] dark:bg-[#1E1E2A]
           border border-surface-border dark:border-[#2A2A3A]
           rounded-2xl p-6 md:p-8
           hover:shadow-lg hover:border-transparent
           transition-all duration-300;
  }
}
```

---

#### NOVO: `landing/src/app/layout.tsx`

```tsx
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Analytics } from '@vercel/analytics/react'; // opcional
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Foome — Comida boa, na hora certa',
  description:
    'App de delivery de comida. Descubra restaurantes perto de você, peça com um toque e acompanhe seu pedido em tempo real.',
  keywords: ['delivery', 'comida', 'restaurante', 'app', 'react native', 'expo'],
  openGraph: {
    title: 'Foome — Comida boa, na hora certa',
    description: 'Descubra restaurantes, peça com um toque, acompanhe em tempo real.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

#### NOVO: `landing/src/app/page.tsx`

```tsx
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { ComoFunciona } from '@/components/ComoFunciona';
import { Screenshots } from '@/components/Screenshots';
import { Download } from '@/components/Download';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ComoFunciona />
        <Screenshots />
        <Download />
      </main>
      <Footer />
    </>
  );
}
```

---

#### NOVO: `landing/src/components/Navbar.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useTheme } from 'next-themes';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);
  });

  useEffect(() => setMounted(true), []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? 'glass shadow-sm' : 'bg-transparent'
      }`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="container-page flex items-center justify-between h-16 md:h-[72px]">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 no-underline">
          <div className="w-[38px] h-[38px] rounded-md bg-brand-light dark:bg-[#2A1513] flex items-center justify-center text-xl">
            🍔
          </div>
          <span className="font-heading font-extrabold text-[22px] text-brand tracking-tight">
            Foome
          </span>
        </a>

        {/* Right side: theme toggle + CTA */}
        <div className="flex items-center gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 rounded-lg border border-surface-border dark:border-[#2A2A3A]
                         flex items-center justify-center
                         hover:border-brand transition-colors"
              aria-label="Alternar tema"
            >
              {/* Sun icon (visible in dark mode) */}
              <svg
                className="h-5 w-5 hidden dark:block text-amber"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              {/* Moon icon (visible in light mode) */}
              <svg
                className="h-5 w-5 block dark:hidden text-ink-3"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </button>
          )}

          <a href="#download" className="btn-primary !py-2.5 !px-5 !text-sm hidden sm:inline-flex">
            Baixar App
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
```

---

#### NOVO: `landing/src/components/Hero.tsx`

```tsx
'use client';

import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const mockups = [
  { emoji: '🍔', label: 'Home',   delay: 0.4 },
  { emoji: '🛵', label: 'Mapa',   delay: 0.6 },
  { emoji: '📋', label: 'Pedidos', delay: 0.8 },
];

export function Hero() {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-28 text-center bg-gradient-to-b from-white to-[#F5F5FA] dark:from-[#12121A] dark:to-[#0E0E14]">
      <div className="container-page">
        <motion.div variants={container} initial="hidden" animate="show">
          {/* Tag */}
          <motion.div variants={item}>
            <span className="section-tag">📱 App de delivery</span>
          </motion.div>

          {/* Título */}
          <motion.h1 variants={item} className="section-title !text-4xl md:!text-5xl lg:!text-6xl !max-w-3xl !mx-auto">
            Comida boa,{' '}
            <span className="text-brand">na hora certa</span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p variants={item} className="section-subtitle !max-w-xl">
            Descubra os melhores restaurantes da sua região, peça com poucos toques
            e acompanhe cada etapa até a entrega.
          </motion.p>

          {/* Botões */}
          <motion.div variants={item} className="flex gap-3 justify-center flex-wrap mt-8">
            <a href="#download" className="btn-primary">
              Baixar agora
            </a>
            <a href="#features" className="btn-secondary">
              Ver recursos
            </a>
          </motion.div>
        </motion.div>

        {/* Mockups flutuantes */}
        <div className="mt-16 flex justify-center gap-4 md:gap-6 flex-wrap">
          {mockups.map((m, i) => (
            <motion.div
              key={m.label}
              className="relative w-[140px] h-[280px] md:w-[200px] md:h-[400px]
                         bg-white dark:bg-[#1E1E2A]
                         rounded-[32px] border-[3px] border-surface-border dark:border-[#2A2A3A]
                         shadow-xl shadow-ink/5 dark:shadow-black/20
                         flex items-center justify-center text-5xl md:text-7xl
                         animate-float"
              style={{ animationDelay: `${m.delay}s` }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: m.delay, ease: 'easeOut' }}
            >
              {m.emoji}
              <span className="absolute bottom-6 font-heading font-bold text-xs md:text-sm text-brand">
                {m.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

#### NOVO: `landing/src/components/Features.tsx`

```tsx
'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    emoji: '🔐',
    title: 'Login com Biometria',
    description:
      'Autenticação rápida e segura com sua digital ou Face ID. Sem precisar digitar senha toda vez.',
  },
  {
    emoji: '🗺️',
    title: 'Mapa Interativo',
    description:
      'Encontre restaurantes próximos com geolocalização real e navegação intuitiva pelo mapa.',
  },
  {
    emoji: '📋',
    title: 'Histórico de Pedidos',
    description:
      'Acompanhe todos os seus pedidos com status em tempo real e timeline animada de cada etapa.',
  },
  {
    emoji: '🌙',
    title: 'Dark Mode',
    description:
      'Interface adaptável ao tema do seu dispositivo. Conforto visual a qualquer hora do dia.',
  },
];

export function Features() {
  return (
    <section id="features" className="section-padding bg-white dark:bg-[#12121A]">
      <div className="container-page">
        {/* Heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">Recursos</span>
          <h2 className="section-title">Tudo que você precisa</h2>
          <p className="section-subtitle">
            Funcionalidades pensadas para tornar seu pedido rápido, seguro e prazeroso.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="card text-center group"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="w-16 h-16 rounded-lg bg-white dark:bg-[#12121A] border border-surface-border dark:border-[#2A2A3A] flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                {f.emoji}
              </div>
              <h3 className="font-heading font-semibold text-lg text-ink dark:text-[#F0F0F7] mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-ink-3 dark:text-[#9494B2] leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

#### NOVO: `landing/src/components/ComoFunciona.tsx`

```tsx
'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    step: 1,
    title: 'Escolha seu restaurante',
    description:
      'Navegue por categorias, busque por nome ou explore pelo mapa. Encontre o que quiser em segundos.',
  },
  {
    step: 2,
    title: 'Monte seu pedido',
    description:
      'Adicione itens ao carrinho, escolha quantidade, tamanho e adicione observações especiais.',
  },
  {
    step: 3,
    title: 'Acompanhe a entrega',
    description:
      'Confirme com biometria e acompanhe seu pedido em tempo real até a entrega. Depois, avalie!',
  },
];

export function ComoFunciona() {
  return (
    <section className="section-padding bg-[#F5F5FA] dark:bg-[#0E0E14]">
      <div className="container-page">
        {/* Heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">Como funciona</span>
          <h2 className="section-title">Em 3 passos simples</h2>
          <p className="section-subtitle">
            Do cardápio à sua porta em minutos.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-[620px] mx-auto flex flex-col gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              className="flex gap-5 items-start"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              {/* Número */}
              <div className="w-12 h-12 min-w-[48px] rounded-md bg-brand text-white font-heading font-bold text-xl flex items-center justify-center shadow-lg shadow-brand/30">
                {s.step}
              </div>
              {/* Conteúdo */}
              <div>
                <h3 className="font-heading font-semibold text-lg text-ink dark:text-[#F0F0F7] mb-1">
                  {s.title}
                </h3>
                <p className="text-sm text-ink-3 dark:text-[#9494B2] leading-relaxed">
                  {s.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

#### NOVO: `landing/src/components/Screenshots.tsx`

Carrossel horizontal com drag e snap points usando Framer Motion:

```tsx
'use client';

import { useState, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';

const screenshots = [
  { emoji: '🏠', label: 'Home',     desc: 'Explore restaurantes por categoria' },
  { emoji: '🍔', label: 'Cardápio', desc: 'Adicione itens com um toque' },
  { emoji: '🛒', label: 'Carrinho', desc: 'Revise e confirme com biometria' },
  { emoji: '🗺️', label: 'Mapa',     desc: 'Encontre os mais próximos' },
  { emoji: '📋', label: 'Pedidos',  desc: 'Acompanhe status em tempo real' },
  { emoji: '👤', label: 'Perfil',   desc: 'Dark mode e configurações' },
];

export function Screenshots() {
  const [activeIdx, setActiveIdx] = useState(0);
  const constraintsRef = useRef<HTMLDivElement>(null);

  function handleDragEnd(_: any, info: PanInfo) {
    const threshold = 50;
    if (info.offset.x < -threshold && activeIdx < screenshots.length - 1) {
      setActiveIdx(prev => prev + 1);
    } else if (info.offset.x > threshold && activeIdx > 0) {
      setActiveIdx(prev => prev - 1);
    }
  }

  return (
    <section className="section-padding bg-white dark:bg-[#12121A] overflow-hidden">
      <div className="container-page">
        {/* Heading */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">Screenshots</span>
          <h2 className="section-title">Conheça o app</h2>
          <p className="section-subtitle">
            Interface intuitiva pensada para o seu dia a dia.
          </p>
        </motion.div>

        {/* Carrossel */}
        <div ref={constraintsRef} className="relative max-w-[300px] md:max-w-[500px] mx-auto overflow-hidden">
          <motion.div
            className="flex gap-4"
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            animate={{ x: -activeIdx * 324 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {screenshots.map((s) => (
              <div
                key={s.label}
                className="min-w-[280px] md:min-w-[280px] h-[480px]
                           bg-[#F5F5FA] dark:bg-[#1E1E2A]
                           border border-surface-border dark:border-[#2A2A3A]
                           rounded-[32px]
                           flex flex-col items-center justify-center
                           shadow-lg shadow-ink/5 dark:shadow-black/20
                           select-none"
              >
                <span className="text-6xl mb-6">{s.emoji}</span>
                <span className="font-heading font-bold text-lg text-ink dark:text-[#F0F0F7]">
                  {s.label}
                </span>
                <span className="text-sm text-ink-3 dark:text-[#9494B2] mt-2 text-center px-6">
                  {s.desc}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {screenshots.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === activeIdx
                  ? 'bg-brand w-7'
                  : 'bg-surface-border dark:bg-[#2A2A3A]'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

#### NOVO: `landing/src/components/Download.tsx`

```tsx
'use client';

import { motion } from 'framer-motion';

export function Download() {
  return (
    <section id="download" className="section-padding bg-brand">
      <div className="container-page text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-3 tracking-tight">
            Pronto para pedir?
          </h2>
          <p className="text-white/70 text-base md:text-lg max-w-md mx-auto mb-8">
            Baixe o Foome agora e experimente o delivery como ele deveria ser.
          </p>

          {/* Badges App Store / Google Play (mock) */}
          <div className="flex gap-3 justify-center flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 bg-white text-ink font-heading font-bold px-7 py-3.5 rounded-lg shadow-lg shadow-black/15 text-sm"
            >
              <span className="text-xl">🍎</span>
              <div className="text-left">
                <div className="text-[10px] font-sans font-medium text-ink-3 leading-none">Baixar na</div>
                <div className="text-base leading-tight">App Store</div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 bg-ink dark:bg-black text-white font-heading font-bold px-7 py-3.5 rounded-lg shadow-lg shadow-black/20 text-sm"
            >
              <span className="text-xl">🤖</span>
              <div className="text-left">
                <div className="text-[10px] font-sans font-medium text-white/50 leading-none">Disponível no</div>
                <div className="text-base leading-tight">Google Play</div>
              </div>
            </motion.button>
          </div>

          <p className="text-white/40 text-xs mt-6">
            * Disponível em breve. Inscreva-se para ser notificado.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
```

---

#### NOVO: `landing/src/components/Footer.tsx`

```tsx
export function Footer() {
  return (
    <footer className="bg-ink dark:bg-black py-10 text-center">
      <div className="container-page">
        <div className="font-heading font-extrabold text-2xl text-brand mb-2">Foome</div>
        <p className="text-sm text-ink-3 dark:text-[#9494B2]">
          &copy; {new Date().getFullYear()} Foome. Todos os direitos reservados.
        </p>
        <p className="text-xs text-ink-4 dark:text-[#6A6A82] mt-1">
          Feito com ❤️ em Vassouras, RJ
        </p>
      </div>
    </footer>
  );
}
```

---

#### NOVO: `landing/Dockerfile`

**Multi-stage build:** Stage 1 compila o Next.js, Stage 2 roda com Node.js em produção.

```dockerfile
# ============ STAGE 1: BUILD ============
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependência
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm ci --ignore-scripts

# Copiar código fonte
COPY . .

# Build Next.js
RUN npm run build

# ============ STAGE 2: RUNTIME ============
FROM node:20-alpine AS runner

WORKDIR /app

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar output do build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Usuário não-root
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

CMD ["node", "server.js"]
```

**Importante:** O Next.js 14 precisa de `output: 'standalone'` no `next.config.js` para gerar o build standalone que o Dockerfile multi-stage consome.

#### MODIFICAR: `landing/next.config.js`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    // Permite imagens de placeholder (sem domínio externo)
    unoptimized: true,
  },
};

module.exports = nextConfig;
```

---

#### NOVO: `docker-compose.yml` (na raiz do repositório)

```yaml
version: '3.8'

services:
  foome-landing:
    build:
      context: ./landing
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    restart: unless-stopped
    container_name: foome_landing
    environment:
      - NODE_ENV=production
```

---

#### NOVO: `landing/README_LANDING.md`

```markdown
# Foome — Landing Page

Landing page do app Foome construída com **Next.js 14 + TypeScript + Tailwind CSS + Framer Motion**.

## Stack

- **Next.js 14** — App Router, Server Components
- **TypeScript** — tipagem estática
- **Tailwind CSS 3** — utility-first, design tokens alinhados ao app
- **Framer Motion 11** — animações declarativas (scroll, stagger, gestos)
- **next-themes** — dark mode com `prefers-color-scheme` + toggle manual
- **next/font** — Inter (corpo) + Poppins (títulos), sem fontes externas

## Rodar localmente

### Com Docker (recomendado)

\`\`\`bash
# Na raiz do repositório:
docker-compose up -d foome-landing

# Acesse: http://localhost:3000
\`\`\`

### Sem Docker (dev)

\`\`\`bash
cd landing
npm install
npm run dev

# Acesse: http://localhost:3000
\`\`\`

## Build de produção

\`\`\`bash
cd landing
npm run build
npm start
\`\`\`

## Estrutura

\`\`\`
landing/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # RootLayout: providers + fontes
│   │   ├── page.tsx        # HomePage (monta seções)
│   │   └── globals.css     # Tailwind + custom components
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── ComoFunciona.tsx
│   │   ├── Screenshots.tsx
│   │   ├── Download.tsx
│   │   └── Footer.tsx
│   └── lib/
│       └── theme.ts        # Design tokens (cores, dark mode)
├── public/
│   └── mockups/
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
├── Dockerfile
├── package.json
└── README_LANDING.md
\`\`\`

## Seções

1. **Navbar** — Logo + toggle dark mode + CTA "Baixar App"
2. **Hero** — Animação staggered, mockups flutuantes, botões CTA
3. **Features** — Grid 4 cards com scroll-triggered animation
4. **Como funciona** — 3 passos com stagger ao scroll
5. **Screenshots** — Carrossel arrastável com Framer Motion drag
6. **Download** — Badges App Store / Google Play (mock)
7. **Footer** — Copyright

## Docker

Dockerfile multi-stage:
- **Stage 1** (`builder`): `node:20-alpine`, `npm ci`, `npm run build`
- **Stage 2** (`runner`): `node:20-alpine`, copia `standalone/`, roda `node server.js`

Next.js configurado com `output: 'standalone'` (necessário para o multi-stage).
\`\`\`
```

### Requisitos Técnicos

- **Node.js 20+** — requerido pelo Next.js 14
- **npm** — gerenciador de pacotes (já usado no app principal)
- **Docker** — para build e deploy da landing (não afeta o app React Native)
- Todas as dependências são instaladas **dentro de `landing/`**, NÃO no `package.json` da raiz
- `next/font` faz download e self-hosting das fontes no build — zero chamadas externas a Google Fonts em produção
- `next-themes` usa `attribute="class"` para compatibilidade com Tailwind `dark:`

### Critérios de Entrega

**Scaffold e configuração:**
- [ ] `landing/package.json` com Next.js 14, React 18, Framer Motion, next-themes
- [ ] `landing/tsconfig.json` com paths configurados (`@/*` → `src/*`)
- [ ] `landing/tailwind.config.ts` com design tokens (cores, fontes, animações)
- [ ] `landing/next.config.js` com `output: 'standalone'`
- [ ] `landing/postcss.config.js` com Tailwind + autoprefixer

**Seções (6 componentes):**
- [ ] `Navbar.tsx` — glass effect ao scroll, toggle dark mode funcional, CTA
- [ ] `Hero.tsx` — animação staggered (tag → título → subtítulo → botões), 3 mockups flutuantes
- [ ] `Features.tsx` — grid 4 cards, scroll-triggered com `whileInView`
- [ ] `ComoFunciona.tsx` — 3 passos numerados, stagger horizontal ao scroll
- [ ] `Screenshots.tsx` — carrossel com drag (Framer Motion), dots indicadores
- [ ] `Download.tsx` — fundo brand, badges App Store/Google Play mock, hover/tap animation
- [ ] `Footer.tsx` — copyright

**Qualidade visual:**
- [ ] Design 100% alinhado ao tema Foome (`#E8452C`, Inter, Poppins)
- [ ] Dark mode funcional (sistema + toggle manual)
- [ ] Transições suaves entre light/dark (sem flash)
- [ ] 100% responsivo (375px → 768px → 1024px → 1440px)
- [ ] Animações respeitam `prefers-reduced-motion` (Framer Motion faz isso nativamente)
- [ ] Performance: Lighthouse ≥ 90

**Docker:**
- [ ] `landing/Dockerfile` multi-stage (build → runtime)
- [ ] `docker-compose.yml` na raiz com porta `3000:3000`
- [ ] `docker-compose up -d foome-landing` sobe o serviço
- [ ] Landing acessível em `http://localhost:3000`
- [ ] Container usa usuário não-root (`nextjs`)

**Documentação:**
- [ ] `landing/README_LANDING.md` com instruções de dev, build e Docker

### Exemplos e Referências

**Paleta de cores (Tailwind):**
```
brand:        #E8452C  (bg-brand text-brand)
brand-light:  #FFF0EE (bg-brand-light)
ink:          #17172B (text-ink bg-ink)
ink-3:        #9494B2 (text-ink-3)
surface:      #FFFFFF (bg-surface)
surface-bg:   #F5F5FA (bg-surface-bg)
accent-amber: #FF9B3D
accent-teal:  #00BE99
```

**Classes utilitárias definidas em `globals.css`:**
- `.container-page` — max-width 1100px + padding
- `.section-padding` — py-20 md:py-28
- `.btn-primary` / `.btn-secondary` — botões padronizados
- `.section-tag` / `.section-title` / `.section-subtitle` — headings
- `.card` — card com border + hover shadow

**Framer Motion patterns:**
```tsx
// Scroll-triggered fade-up
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-80px' }}
  transition={{ duration: 0.6 }}
>

// Stagger children
<motion.div variants={{
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
}}>
  <motion.div variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}>
```

### Não Faça

- **Não use `create-next-app` via `npx` dentro da raiz do Foome** — scaffoldar dentro de `landing/`
- **Não use Pages Router** — apenas App Router
- **Não use JavaScript** — todos os componentes são `.tsx`
- **Não use Google Fonts CDN** — `next/font` faz self-hosting no build
- **Não use AOS.js, GSAP ou outras libs de animação** — apenas Framer Motion
- **Não use `next/image` para imagens externas** — só placeholders locais (emoji/caixas)
- **Não colete emails nem crie formulários** — botões são mock
- **Não adicione dependências ao `package.json` do app React Native** — landing é independente
- **Não faça deploy real** — apenas container local
- **Não use `nginx` no Docker** — o servidor é o próprio Node.js (Next.js production server)
- **Não crie API routes** — landing é 100% estática (pode usar `output: 'standalone'` com ISR/SSG)
- **Não use `next-intl` ou i18n** — apenas pt-BR
