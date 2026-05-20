# Foome - Landing Page

Landing page do app Foome construída com **Next.js 14 + TypeScript + Tailwind CSS + Framer Motion**.

## Stack

- **Next.js 14** - App Router, Server Components
- **TypeScript** - tipagem estática
- **Tailwind CSS 3** - utility-first, design tokens alinhados ao app
- **Framer Motion 11** - animações declarativas (scroll, stagger, gestos)
- **next-themes** - dark mode com `prefers-color-scheme` + toggle manual
- **next/font** - Inter (corpo) + Poppins (títulos), sem fontes externas em produção

## Rodar localmente

### Com Docker

```bash
# Na raiz do repositório:
docker-compose up -d foome-landing

# Acesse: http://localhost:3000
```

Se a porta `3000` já estiver em uso:

```bash
FOOME_LANDING_PORT=3001 docker-compose up -d foome-landing

# Acesse: http://localhost:3001
```

### Sem Docker

```bash
cd landing
npm install
npm run dev

# Acesse: http://localhost:3000
```

## Build de produção

```bash
cd landing
npm run build
npm start
```

## Estrutura

```text
landing/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── ComoFunciona.tsx
│   │   ├── Screenshots.tsx
│   │   ├── Download.tsx
│   │   └── Footer.tsx
│   └── lib/
│       └── theme.ts
├── public/
│   └── mockups/
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
├── Dockerfile
├── package.json
└── README_LANDING.md
```

## Seções

1. **Navbar** - logo, toggle dark mode, CTA e glass effect ao scroll
2. **Hero** - animação staggered, CTAs e três mockups flutuantes
3. **Features** - grid com quatro cards e animação ao scroll
4. **Como funciona** - três passos numerados com entrada horizontal
5. **Screenshots** - carrossel arrastável com dots indicadores
6. **Download** - badges mock de App Store e Google Play
7. **Footer** - copyright

## Docker

O Dockerfile usa build multi-stage:

- **Stage 1** (`builder`): `node:20-alpine`, `npm ci`, `npm run build`
- **Stage 2** (`runner`): `node:20-alpine`, copia `standalone/`, roda `node server.js`

O Next.js está configurado com `output: 'standalone'`, necessário para o runtime enxuto no container.
