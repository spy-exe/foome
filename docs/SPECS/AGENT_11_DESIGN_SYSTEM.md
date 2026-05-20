# AGENT 11 — Design System e Componentes Reutilizáveis
## Foome — Spec de Desenvolvimento

### Contexto

O projeto tem apenas 4 componentes reutilizáveis (`InputField`, `PrimaryButton`, `RestauranteCard`, `Stepper`). Não existe:
- Sistema de spacing/border-radius padronizado
- Componentes de feedback (Toast, EmptyState, Badge, SkeletonLoader)
- Componentes de layout (BottomSheet)
- Componentes de display (Avatar, RatingStars)

O tema (`constants/theme.js`) tem cores e fontes mas não tem spacing/border-radius system.

### Objetivo

1. Expandir `constants/theme.js` com spacing e border-radius systems
2. Criar 7 novos componentes reutilizáveis em `components/`
3. Garantir que todos sejam compatíveis com o tema e entre si

### Git Workflow

```bash
git checkout main
git pull origin main
git checkout -b feat/agent-11-design-system

git add .
git commit -m "feat(theme): adicionar spacing e border-radius systems"
# feat(components): criar Toast com 3 tipos e animação slide-in
# feat(components): criar SkeletonLoader com shimmer
# feat(components): criar EmptyState, Badge, BottomSheet, Avatar, RatingStars
# refactor(components): padronizar uso de spacing system

git push origin feat/agent-11-design-system
```

**Regras:**
- Mínimo 3 commits
- Nunca commitar direto na `main`
- Nunca fazer push forçado

### Arquivos a Modificar / Criar

#### MODIFICAR: `constants/theme.js`

Adicionar ao final do arquivo:

```js
// Spacing system (múltiplos de 4)
export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
};

// Border radius system
export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
};

// Animation presets
export const ANIM = {
  fast:   200,
  normal: 300,
  slow:   500,
};

// Haptic presets (referência — usar com expo-haptics)
export const HAPTIC = {
  light:   'light',
  medium:  'medium',
  heavy:   'heavy',
  success: 'success',
  warning: 'warning',
  error:   'error',
};
```

#### NOVO: `components/Toast.js`

```jsx
import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, F, RADIUS, SPACING } from '../constants/theme';

const CONFIG = {
  sucesso: { bg: C.tealLight,  icon: 'check-circle', cor: C.teal,  iconeCor: C.teal },
  erro:    { bg: C.brandLight, icon: 'alert-circle', cor: C.brand, iconeCor: C.brand },
  info:    { bg: C.bg,         icon: 'info',         cor: C.ink,   iconeCor: C.ink2 },
};

/**
 * Toast animado com slide-in/out.
 *
 * Props:
 * - tipo: 'sucesso' | 'erro' | 'info'
 * - mensagem: string
 * - visivel: boolean
 * - duracao: number (ms, default 3000)
 * - onClose: function
 */
export default function Toast({ tipo = 'info', mensagem, visivel, duracao = 3000, onClose }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visivel) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, tension: 100, friction: 10, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: -100, duration: 250, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start(() => onClose?.());
      }, duracao);

      return () => clearTimeout(timer);
    }
  }, [visivel]);

  if (!visivel) return null;

  const cfg = CONFIG[tipo];

  return (
    <Animated.View style={[s.wrap, { backgroundColor: cfg.bg, transform: [{ translateY }], opacity }]}>
      <Feather name={cfg.icon} size={18} color={cfg.iconeCor} />
      <Text style={[s.txt, { color: cfg.cor }]} numberOfLines={2}>{mensagem}</Text>
      <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Feather name="x" size={16} color={cfg.iconeCor} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 60,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  txt: {
    flex: 1,
    fontFamily: F.medium,
    fontSize: 13,
    lineHeight: 18,
  },
});
```

#### NOVO: `components/SkeletonLoader.js`

```jsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { C } from '../constants/theme';

/**
 * Placeholder shimmer para carregamento.
 *
 * Props:
 * - width: number | string (default '100%')
 * - height: number (default 20)
 * - borderRadius: number (default 8)
 * - style: objeto de estilo adicional
 */
export default function SkeletonLoader({ width = '100%', height = 20, borderRadius = 8, style }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.55],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: C.border,
          opacity,
        },
        style,
      ]}
    />
  );
}
```

#### NOVO: `components/EmptyState.js`

```jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, F, SPACING, RADIUS } from '../constants/theme';
import PrimaryButton from './PrimaryButton';

/**
 * Estado vazio com ícone, título, subtítulo e CTA opcional.
 *
 * Props:
 * - icon: string (Feather icon name, default 'inbox')
 * - titulo: string
 * - subtitulo: string
 * - ctaLabel: string (se fornecido, mostra botão)
 * - onCtaPress: function
 */
export default function EmptyState({ icon = 'inbox', titulo, subtitulo, ctaLabel, onCtaPress }) {
  return (
    <View style={s.wrap}>
      <View style={s.iconWrap}>
        <Feather name={icon} size={36} color={C.ink4} />
      </View>
      <Text style={s.titulo}>{titulo}</Text>
      {subtitulo ? <Text style={s.sub}>{subtitulo}</Text> : null}
      {ctaLabel && (
        <PrimaryButton label={ctaLabel} onPress={onCtaPress} style={{ marginTop: SPACING.lg }} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap:     { alignItems: 'center', paddingVertical: SPACING.xxl, paddingHorizontal: SPACING.xl },
  iconWrap: {
    width: 80, height: 80,
    borderRadius: RADIUS.lg,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: C.border,
  },
  titulo: { fontFamily: F.heading, fontSize: 17, color: C.ink, marginBottom: SPACING.sm, textAlign: 'center' },
  sub:    { fontFamily: F.regular, fontSize: 14, color: C.ink3, textAlign: 'center', lineHeight: 20 },
});
```

#### NOVO: `components/Badge.js`

```jsx
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { C, F } from '../constants/theme';

/**
 * Badge animado com contador. Anima scale quando valor muda.
 *
 * Props:
 * - value: number
 * - cor: string (default C.brand)
 * - max: number (default 99, acima mostra "99+")
 */
export default function Badge({ value, cor = C.brand, max = 99 }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (value > 0) {
      scale.value = withSpring(1.4, { stiffness: 300 }, () => {
        scale.value = withSpring(1);
      });
    }
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (value <= 0) return null;

  const display = value > max ? `${max}+` : String(value);

  return (
    <Animated.View style={[s.badge, { backgroundColor: cor }, animatedStyle]}>
      <Animated.Text style={s.txt}>{display}</Animated.Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  txt: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#fff',
  },
});
```

#### NOVO: `components/BottomSheet.js`

```jsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { C, SHADOW, RADIUS } from '../constants/theme';

const { height } = Dimensions.get('window');

/**
 * Bottom sheet genérico com drag handle, backdrop e snap points.
 *
 * Props:
 * - visivel: boolean
 * - onClose: function
 * - altura: number (default 350)
 * - children: React nodes
 */
export default function BottomSheet({ visivel, onClose, altura = 350, children }) {
  const translateY = useRef(new Animated.Value(altura)).current;

  useEffect(() => {
    if (visivel) {
      Animated.spring(translateY, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: altura,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visivel, altura]);

  if (!visivel) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <TouchableOpacity
        style={[StyleSheet.absoluteFill, s.backdrop]}
        activeOpacity={1}
        onPress={onClose}
      />
      {/* Sheet */}
      <Animated.View
        style={[
          s.sheet,
          { height: altura, transform: [{ translateY }] },
        ]}
      >
        <View style={s.handle} />
        {children}
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 42 : 20,
    ...SHADOW.sheet,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: 18,
  },
});
```

#### NOVO: `components/Avatar.js`

```jsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, F, RADIUS } from '../constants/theme';

const SIZES = {
  S: 36,
  M: 48,
  L: 72,
};

/**
 * Avatar com foto ou iniciais com fallback.
 *
 * Props:
 * - uri: string | null (URI da foto)
 * - nome: string (para gerar iniciais)
 * - tamanho: 'S' | 'M' | 'L' (default 'M')
 */
export default function Avatar({ uri, nome = '', tamanho = 'M' }) {
  const size = SIZES[tamanho];
  const fontSize = tamanho === 'L' ? 24 : tamanho === 'M' ? 18 : 14;
  const iniciais = nome
    .split(' ')
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const borderWidth = tamanho === 'L' ? 3 : 2;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[s.img, { width: size, height: size, borderRadius: size / 2, borderWidth, borderColor: C.brand }]}
      />
    );
  }

  return (
    <View style={[
      s.fallback,
      { width: size, height: size, borderRadius: size / 2, borderWidth, borderColor: C.border },
    ]}>
      {iniciais ? (
        <Text style={[s.iniciais, { fontSize }]}>{iniciais}</Text>
      ) : (
        <Feather name="user" size={fontSize} color={C.ink3} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  img:       { overflow: 'hidden' },
  fallback:  { backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  iniciais:  { fontFamily: F.headingSm, color: C.ink2 },
});
```

#### NOVO: `components/RatingStars.js`

```jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, F, SPACING } from '../constants/theme';

/**
 * Estrelas de avaliação com valor numérico.
 *
 * Props:
 * - valor: number (0–5)
 * - max: number (default 5)
 * - tamanho: number (default 14)
 * - mostrarValor: boolean (default true)
 */
export default function RatingStars({ valor = 0, max = 5, tamanho = 14, mostrarValor = true }) {
  const stars = [];
  for (let i = 1; i <= max; i++) {
    if (valor >= i) {
      stars.push(<Ionicons key={i} name="star" size={tamanho} color={C.amber} />);
    } else if (valor >= i - 0.5) {
      stars.push(<Ionicons key={i} name="star-half" size={tamanho} color={C.amber} />);
    } else {
      stars.push(<Ionicons key={i} name="star-outline" size={tamanho} color={C.ink4} />);
    }
  }

  return (
    <View style={s.row}>
      <View style={s.stars}>{stars}</View>
      {mostrarValor && <Text style={s.txt}>{valor.toFixed(1)}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  stars: { flexDirection: 'row', gap: 2 },
  txt:   { fontFamily: F.bold, fontSize: 13, color: '#92530A', marginLeft: 2 },
});
```

### Requisitos Técnicos

- **Nenhuma dependência nova** — tudo é React Native + Reanimated (já instalado)
- `@expo/vector-icons` para ícones (Feather, Ionicons) — já disponível
- Componentes devem ser exportados como `default`

### Critérios de Entrega

- [ ] `theme.js` expandido com SPACING, RADIUS, ANIM, HAPTIC
- [ ] `Toast.js` — 3 tipos funcionando com animação slide-in/out e auto-dismiss
- [ ] `SkeletonLoader.js` — shimmer animado com props configuráveis
- [ ] `EmptyState.js` — ícone + título + subtítulo + CTA opcional
- [ ] `Badge.js` — contador com animação de scale ao mudar valor
- [ ] `BottomSheet.js` — backdrop + drag handle + snap point configurável
- [ ] `Avatar.js` — foto ou iniciais, 3 tamanhos
- [ ] `RatingStars.js` — estrelas com meia-estrela + valor numérico
- [ ] Todos os componentes usam `C`, `F`, `SPACING`, `RADIUS` do tema
- [ ] Todos os componentes com `export default`
- [ ] Zero crashes ao usar qualquer componente isoladamente

### Não Faça

- **Não modifique InputField, PrimaryButton, Stepper ou RestauranteCard** — outros agentes podem depender deles
- **Não crie arquivo de índice (index.js) para componentes** — mantenha imports individuais
- **Não instale React Native Paper, NativeBase ou qualquer UI kit** — componentes são custom
- **Não crie temas dark/light agora** — AGENT 13 fará
- **Não adicione PropTypes** — o projeto não usa
