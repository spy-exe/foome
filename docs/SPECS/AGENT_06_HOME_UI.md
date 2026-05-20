# AGENT 06 — UI/UX HomeScreen
## Foome — Spec de Desenvolvimento

### Contexto

A HomeScreen atual (`screens/HomeScreen.js`) é funcional mas básica:
- Header com saudação + avatar (estático, avatar não é clicável)
- Busca textual simples (sem debounce, sem highlight)
- Chips de categoria (8 categorias, scroll horizontal, sem animação de seleção)
- Banner promocional estático (1 banner fixo)
- Lista de restaurantes com `RestauranteCard`
- Empty state simples

Falta:
- Skeleton loading enquanto os dados "carregam"
- Pull-to-refresh
- Carrossel de banners com auto-scroll
- Seções personalizadas ("Para você", "Mais pedidos", "Novidades")
- Debounce na busca
- Animação nos chips e cards
- Avatar clicável para perfil

### Objetivo

1. **Skeleton loading** — shimmer placeholder enquanto dados carregam
2. **Pull-to-refresh** — com indicador customizado (se AGENT 11 já fez SkeletonLoader, usar; senão, criar inline)
3. **Header sticky** com avatar clicável → navega pro Perfil
4. **Banner carrossel** com dots, auto-scroll de 4s, swipe manual
5. **Chips de categoria** com animação de seleção (scale + cor)
6. **Seções** — "Para você", "Mais pedidos 🔥", "Perto de você"
7. **Busca** com debounce de 300ms e highlight do termo
8. **Cards** com animação de press (scale 0.97 no onPressIn)

### Git Workflow

```bash
git checkout main
git pull origin main
git checkout -b feat/agent-06-home-ui

git add .
git commit -m "feat(home): implementar skeleton loading e pull-to-refresh"
# feat(home): adicionar carrossel de banners com auto-scroll
# feat(home): criar seções personalizadas com base no histórico
# feat(home): adicionar animações nos chips, cards e busca com debounce

git push origin feat/agent-06-home-ui
```

**Regras:**
- Mínimo 3 commits
- Nunca commitar direto na `main`
- Nunca fazer push forçado

### Arquivos a Modificar / Criar

#### MODIFICAR: `screens/HomeScreen.js`

**Estrutura geral da HomeScreen renovada:**

```jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  StatusBar, Image, Platform, TextInput, RefreshControl,
  FlatList, Dimensions, Animated,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { RESTAURANTES, formatarPreco } from '../services/dados';
import { getPedidos } from '../services/storage';
import { useApp } from '../contexts/AppContext';
import { C, F, SHADOW } from '../constants/theme';
import RestauranteCard from '../components/RestauranteCard';
import SkeletonLoader from '../components/SkeletonLoader';

const { width } = Dimensions.get('window');

const CATEGORIAS = [
  { key: 'Hambúrgueres', label: 'Burgers',   icon: 'fast-food-outline' },
  { key: 'Pizzas',       label: 'Pizza',     icon: 'pizza-outline' },
  { key: 'Japonês',      label: 'Sushi',     icon: 'fish-outline' },
  { key: 'Mexicano',     label: 'Mexicano',  icon: 'flame-outline' },
  { key: 'Saudável',     label: 'Saudável',  icon: 'leaf-outline' },
  { key: 'Massas',       label: 'Massas',    icon: 'restaurant-outline' },
  { key: 'Churrasco',    label: 'Churrasco', icon: 'bonfire-outline' },
  { key: 'Açaí',         label: 'Açaí',      icon: 'cafe-outline' },
];

const BANNERS = [
  {
    id: '1',
    titulo: 'Frete grátis',
    subtitulo: 'Em pedidos acima de R$ 30',
    cor: C.brand,
    icone: 'truck',
    tag: 'OFERTA DO DIA',
  },
  {
    id: '2',
    titulo: 'Novo: Açaí da Vila',
    subtitulo: 'Peça já e aproveite',
    cor: '#9333EA',
    icone: 'heart',
    tag: 'NOVIDADE',
  },
  {
    id: '3',
    titulo: '10% off no pix',
    subtitulo: 'Use o cupom FOOME10',
    cor: C.teal,
    icone: 'dollar-sign',
    tag: 'CUPOM',
  },
];
```

**1. Skeleton Loading**

Enquanto os dados "carregam" (simular com um pequeno delay), mostrar skeletons:

```jsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  // Simular carregamento inicial
  const t = setTimeout(() => setLoading(false), 800);
  return () => clearTimeout(t);
}, []);

function HomeSkeleton() {
  return (
    <View style={{ padding: 16 }}>
      {/* Banner skeleton */}
      <SkeletonLoader width={width - 32} height={110} borderRadius={22} style={{ marginBottom: 20 }} />
      {/* Chips skeleton */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
        {[1,2,3,4,5].map(i => (
          <SkeletonLoader key={i} width={80} height={36} borderRadius={22} />
        ))}
      </View>
      {/* Cards skeleton */}
      {[1,2,3].map(i => (
        <SkeletonLoader key={i} width={width - 32} height={140} borderRadius={20} style={{ marginBottom: 12 }} />
      ))}
    </View>
  );
}
```

**Se `SkeletonLoader` não existir (AGENT 11 pode não ter rodado ainda), criar inline:**

```jsx
// Skeleton inline simples
function Skeleton({ width: w, height: h, borderRadius: r, style }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View style={[{ width: w, height: h, borderRadius: r, backgroundColor: C.border, opacity }, style]} />
  );
}
```

Se o AGENT 11 já tiver criado `components/SkeletonLoader.js`, importe e use. Se não, crie o inline acima.

**2. Pull-to-refresh**

```jsx
const [refreshing, setRefreshing] = useState(false);

function onRefresh() {
  setRefreshing(true);
  // Simular refresh
  setTimeout(() => setRefreshing(false), 1200);
}
```

**3. Header sticky com avatar clicável**

O header atual já é "sticky" (está fora do ScrollView). Manter, mas adicionar navegação no avatar:

```jsx
<TouchableOpacity
  onPress={() => navigation.navigate('PerfilTab')}
  activeOpacity={0.8}
>
  {usuario.fotoUri ? (
    <Image source={{ uri: usuario.fotoUri }} style={s.avatar} />
  ) : (
    <View style={[s.avatar, s.avatarFallback]}>
      <Feather name="user" size={18} color={C.ink3} />
    </View>
  )}
</TouchableOpacity>
```

**4. Banner carrossel**

```jsx
const [bannerIdx, setBannerIdx] = useState(0);
const bannerTimer = useRef(null);

useEffect(() => {
  if (!busca) {
    bannerTimer.current = setInterval(() => {
      setBannerIdx(prev => (prev + 1) % BANNERS.length);
    }, 4000);
  }
  return () => clearInterval(bannerTimer.current);
}, [busca]);

// No render:
{banners.length > 0 && !busca && (
  <View style={{ marginTop: 16, marginHorizontal: 16 }}>

    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={(e) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
        setBannerIdx(idx);
      }}
      scrollEventThrottle={16}
    >
      {banners.map(b => (
        <View key={b.id} style={[s.banner, { backgroundColor: b.cor, width: width - 32 }]}>
          <View>
            <Text style={s.bannerTag}>{b.tag}</Text>
            <Text style={s.bannerTitle}>{b.titulo}</Text>
            <Text style={s.bannerSub}>{b.subtitulo}</Text>
          </View>
          <Feather name={b.icone} size={48} color="rgba(255,255,255,0.25)" />
        </View>
      ))}
    </ScrollView>

    {/* Dots */}
    <View style={s.dots}>
      {banners.map((_, i) => (
        <View key={i} style={[s.dot, i === bannerIdx && s.dotAtivo]} />
      ))}
    </View>
  </View>
)}
```

**5. Chips com animação de seleção**

```jsx
function Chip({ cat, ativa, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.92, useNativeDriver: true }).start();
  }
  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    onPress();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[s.catChip, ativa && s.catChipOn]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Ionicons name={cat.icon} size={16} color={ativa ? C.brand : C.ink3} />
        <Text style={[s.catTxt, ativa && s.catTxtOn]}>{cat.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
```

**6. Seções personalizadas**

```jsx
// "Mais pedidos 🔥" — baseado no histórico
const [maisPedidos, setMaisPedidos] = useState([]);

useEffect(() => {
  getPedidos().then(pedidos => {
    // Extrair IDs de restaurantes dos pedidos anteriores
    const ids = [...new Set(pedidos.map(p => p.restauranteNome))];
    const rests = ids
      .map(nome => RESTAURANTES.find(r => r.nome === nome))
      .filter(Boolean);
    setMaisPedidos(rests.slice(0, 3));
  });
}, []);
```

Seções no render:
```jsx
{!busca && !catAtiva && maisPedidos.length > 0 && (
  <>
    <Text style={s.sectionLabel}>Mais pedidos 🔥</Text>
    {maisPedidos.map(rest => (
      <RestauranteCard key={rest.id} restaurante={rest} onPress={...} />
    ))}
  </>
)}

{!busca && !catAtiva && (
  <Text style={s.sectionLabel}>Perto de você</Text>
)}

{/* Se tiver busca, mostrar "Resultados (N)" */}
```

**7. Busca com debounce e highlight**

```jsx
const [busca, setBusca] = useState('');
const [termoDebounced, setTermoDebounced] = useState('');
const debounceRef = useRef(null);

function handleBusca(texto) {
  setBusca(texto);
  clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => {
    setTermoDebounced(texto);
  }, 300);
}

// Filtrar usando termoDebounced
const lista = useMemo(() => {
  return RESTAURANTES.filter(r => {
    if (catAtiva && r.categoria !== catAtiva) return false;
    if (!termoDebounced) return true;
    const q = termoDebounced.toLowerCase();
    return r.nome.toLowerCase().includes(q) || r.categoria.toLowerCase().includes(q);
  });
}, [catAtiva, termoDebounced]);
```

Para highlight do termo no resultado (opcional, mais complexo):
```jsx
function highlightText(texto, termo) {
  if (!termo) return <Text>{texto}</Text>;
  const idx = texto.toLowerCase().indexOf(termo.toLowerCase());
  if (idx === -1) return <Text>{texto}</Text>;
  return (
    <Text>
      {texto.slice(0, idx)}
      <Text style={{ backgroundColor: C.amberLight, fontFamily: F.bold }}>
        {texto.slice(idx, idx + termo.length)}
      </Text>
      {texto.slice(idx + termo.length)}
    </Text>
  );
}
```

**8. Cards com animação de press**

Modificar `RestauranteCard.js`:

```jsx
// No TouchableOpacity do card:
<TouchableOpacity
  style={s.card}
  activeOpacity={1}
  onPressIn={() => scaleAnim.value = withTiming(0.97, { duration: 100 })}
  onPressOut={() => scaleAnim.value = withTiming(1, { duration: 100 })}
  onPress={onPress}
>
  <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
    {/* ... conteúdo do card ... */}
  </Animated.View>
</TouchableOpacity>
```

### Requisitos Técnicos

- Reanimated 4.1.1 — já instalado (para animações)
- `SkeletonLoader` — importar de `../components/SkeletonLoader` se existir, senão criar inline
- `useApp()` de `../contexts/AppContext` para obter usuário
- `getPedidos()` de `../services/storage` para seção "Mais pedidos"

### Critérios de Entrega

- [ ] Skeleton loading visível ao montar a tela (800ms simulados)
- [ ] Pull-to-refresh funcional (ao puxar, recarrega)
- [ ] Avatar no header navega para Perfil ao tocar
- [ ] Banner carrossel com 3 banners, auto-scroll de 4s, dots indicadores
- [ ] Chips com animação de scale ao pressionar
- [ ] Seção "Mais pedidos 🔥" aparece se usuário tem histórico
- [ ] Seção "Perto de você" com todos restaurantes (sem filtro)
- [ ] Busca com debounce de 300ms
- [ ] Cards com animação de press (scale 0.97)
- [ ] Empty state quando busca não encontra resultados
- [ ] Busca mostra "Resultados (N)" no cabeçalho da seção

### Exemplos e Referências

Dados mockados — use `RESTAURANTES` de `services/dados.js`. A estrutura:
```js
{
  id, nome, categoria, avaliacao, tempo, entrega, cor, emoji,
  lat, lng,
  produtos: [{ id, nome, descricao, preco, emoji }]
}
```

### Não Faça

- **Não crie API ou backend** — os dados continuam mockados
- **Não modifique `services/dados.js`** — use os dados como estão
- **Não mude a assinatura de `RestauranteCard`** — apenas adicione animação interna
- **Não implemente scroll infinito** — a lista é pequena (8 restaurantes)
- **Não crie telas novas** — apenas modifique HomeScreen e RestauranteCard
- **Não faça geolocalização real** — o AGENT 10 fará isso no MapaScreen
