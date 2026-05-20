# AGENT 12 — Animações e Micro-interações
## Foome — Spec de Desenvolvimento

### Contexto

O app tem animações básicas (Animated.timing/spring em alguns lugares), mas falta:
- Transições de tela customizadas no Stack Navigator
- Animação "voa pro carrinho" ao adicionar item
- Shimmer no botão de biometria durante autenticação
- Pull-to-refresh animado criativo
- Stepper com números animados (slide-up/down)
- Haptic feedback em momentos chave (adição, confirmação, erro)
- Skeleton shimmer em listas

### Objetivo

1. **Transições de tela** — slide horizontal nativo com Reanimated
2. **Animação "voa pro carrinho"** — item escala e translada ao CTA
3. **Shimmer biométrico** — animação no botão enquanto processa
4. **Pull-to-refresh criativo** — animação customizada (garfo/emoji girando)
5. **Stepper animado** — números com slide-up/down ao mudar
6. **Haptic feedback global** — em todas as interações do app
7. **Skeleton shimmer** — em todas as listas

### Git Workflow

```bash
git checkout main
git pull origin main
git checkout -b feat/agent-12-animations

git add .
git commit -m "feat(anim): configurar transições de tela customizadas no Stack"
# feat(anim): implementar animação 'voa pro carrinho' no RestauranteScreen
# feat(anim): animar Stepper com slide-up/down nos números
# feat(anim): adicionar haptic feedback em todas as interações
# feat(anim): criar pull-to-refresh animado com ícone Foome

git push origin feat/agent-12-animations
```

**Regras:**
- Mínimo 3 commits
- Nunca commitar direto na `main`
- Nunca fazer push forçado

### Arquivos a Modificar / Criar

#### MODIFICAR: `App.js` (ou `navigation/HomeStack.js`)

**Transições de tela customizadas:**

```jsx
import { CardStyleInterpolators } from '@react-navigation/stack';

// No Stack.Navigator:
<Stack.Navigator
  screenOptions={{
    headerShown: false,
    animationEnabled: true,
    // Transição slide horizontal (padrão iOS, mas forçar no Android também)
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    // Duração da transição
    transitionSpec: {
      open: {
        animation: 'timing',
        config: { duration: 350 },
      },
      close: {
        animation: 'timing',
        config: { duration: 300 },
      },
    },
    gestureEnabled: true,
    gestureDirection: 'horizontal',
  }}
>
```

Isso garante que todas as transições de tela sejam slide horizontal, tanto no iOS quanto no Android.

#### MODIFICAR: `screens/RestauranteScreen.js`

**Animação "voa pro carrinho":**

Quando o usuário toca "+" no Stepper, o item "voa" em direção ao CTA flutuante.

```jsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

function ProdutoCard({ item, cor, onPress }) {
  const flyX = useSharedValue(0);
  const flyY = useSharedValue(0);
  const flyScale = useSharedValue(1);
  const flyOpacity = useSharedValue(1);

  function animarVoo(callback) {
    // Criar um clone visual que voa para o canto inferior (onde fica o CTA)
    flyScale.value = withTiming(0.5, { duration: 150 });
    flyY.value = withTiming(400, { duration: 400, easing: Easing.inOut(Easing.ease) }, () => {
      flyOpacity.value = withTiming(0, { duration: 100 });
      runOnJS(callback)();
      // Resetar
      flyScale.value = 1;
      flyY.value = 0;
      flyOpacity.value = 1;
    });
  }

  const flyStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: flyScale.value },
      { translateY: flyY.value },
    ],
    opacity: flyOpacity.value,
  }));

  return (
    <TouchableOpacity style={s.card} onPress={() => onPress(item)} activeOpacity={0.9}>
      <Animated.View style={[s.prodImg, { backgroundColor: cor + '18' }, flyStyle]}>
        <Text style={{ fontSize: 40 }}>{item.emoji}</Text>
      </Animated.View>

      <View style={s.prodInfo}>
        <Text style={s.prodNome}>{item.nome}</Text>
        <Text style={s.prodDesc} numberOfLines={2}>{item.descricao}</Text>
        <Text style={[s.prodPreco, { color: cor }]}>{formatarPreco(item.preco)}</Text>
      </View>

      <Stepper
        quantidade={qtd(item.id)}
        cor={cor}
        onAdicionar={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          animarVoo(() => adicionar(item));
        }}
        onRemover={() => {
          Haptics.selectionAsync();
          remover(item.id);
        }}
      />
    </TouchableOpacity>
  );
}
```

**Nota:** A animação "voa pro carrinho" é opcional e complexa. Se ficar muito complicada, uma alternativa mais simples é apenas animar o emoji do produto com scale-in e fade ao adicionar.

Versão simplificada (recomendada):
```jsx
function ProdutoCard({ item, cor, onPress }) {
  const addScale = useSharedValue(1);

  function handleAdd() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addScale.value = withSequence(
      withTiming(0.85, { duration: 80 }),
      withTiming(1, { duration: 80 }),
    );
    adicionar(item);
  }

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addScale.value }],
  }));

  return (
    <TouchableOpacity style={s.card} onPress={() => onPress(item)} activeOpacity={0.9}>
      <Animated.View style={[s.prodImg, { backgroundColor: cor + '18' }, emojiStyle]}>
        <Text style={{ fontSize: 40 }}>{item.emoji}</Text>
      </Animated.View>
      {/* ... resto igual ... */}
      <Stepper
        quantidade={qtd(item.id)}
        cor={cor}
        onAdicionar={handleAdd}
        onRemover={() => {
          Haptics.selectionAsync();
          remover(item.id);
        }}
      />
    </TouchableOpacity>
  );
}
```

#### MODIFICAR: `components/Stepper.js`

**Números com slide-up/down animado:**

```jsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { F } from '../constants/theme';

export default function Stepper({ quantidade, cor, onAdicionar, onRemover }) {
  const slideY = useSharedValue(0);
  const prevQtd = useSharedValue(quantidade);

  useEffect(() => {
    if (quantidade > prevQtd.value) {
      // Incrementou — animar pra cima
      slideY.value = withSequence(
        withTiming(-8, { duration: 100 }),
        withTiming(0, { duration: 100 }),
      );
    } else if (quantidade < prevQtd.value && quantidade > 0) {
      // Decrementou — animar pra baixo
      slideY.value = withSequence(
        withTiming(8, { duration: 100 }),
        withTiming(0, { duration: 100 }),
      );
    }
    prevQtd.value = quantidade;
  }, [quantidade]);

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
  }));

  if (quantidade === 0) {
    return (
      <TouchableOpacity style={[s.addBtn, { backgroundColor: cor }]} onPress={onAdicionar}>
        <Feather name="plus" size={18} color="#fff" />
      </TouchableOpacity>
    );
  }

  return (
    <View style={s.row}>
      <TouchableOpacity style={[s.stepBtn, { borderColor: cor }]} onPress={onRemover}>
        <Feather name="minus" size={14} color={cor} />
      </TouchableOpacity>
      <Animated.Text style={[s.count, { color: cor }, textStyle]}>
        {quantidade}
      </Animated.Text>
      <TouchableOpacity style={[s.stepBtn, { backgroundColor: cor, borderColor: cor }]} onPress={onAdicionar}>
        <Feather name="plus" size={14} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

// StyleSheet igual ao original
```

#### MODIFICAR: `screens/LoginScreen.js`

**Shimmer no botão biométrico:**

```jsx
function BioButton({ onPress, usuario }) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (usuario) {
      shimmer.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        true
      );
    }
  }, [usuario]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + shimmer.value * 0.3,
  }));

  return (
    <TouchableOpacity
      style={s.bioBtn}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.8}
    >
      <Animated.View style={[s.bioBtnIcon, shimmerStyle]}>
        <Ionicons name="finger-print" size={26} color={C.brand} />
      </Animated.View>
      <View style={s.bioBtnTxt}>
        <Text style={s.bioBtnTitle}>Entrar com biometria</Text>
        <Text style={s.bioBtnSub}>Digital ou Face ID</Text>
      </View>
      <Feather name="chevron-right" size={18} color={C.brandBorder} />
    </TouchableOpacity>
  );
}
```

#### MODIFICAR: `screens/HomeScreen.js`

**Pull-to-refresh animado:**

Criar um componente de pull-to-refresh customizado. O mais simples é usar um `RefreshControl` com cores do tema:

```jsx
<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={C.brand}
      colors={[C.brand, C.amber, C.teal]}
      progressBackgroundColor={C.surface}
    />
  }
>
```

Ou, para um refresh mais criativo (garfo girando), usar um componente customizado:

```jsx
function FoomeRefreshControl({ refreshing, onRefresh }) {
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (refreshing) {
      rotate.value = withRepeat(
        withTiming(360, { duration: 800 }),
        -1,
        false
      );
    } else {
      rotate.value = withTiming(0);
    }
  }, [refreshing]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  if (!refreshing) return null;

  return (
    <View style={{ height: 60, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={iconStyle}>
        <Text style={{ fontSize: 28 }}>🍔</Text>
      </Animated.View>
      <Text style={{ fontFamily: F.medium, fontSize: 11, color: C.ink3, marginTop: 4 }}>
        Buscando restaurantes...
      </Text>
    </View>
  );
}
```

#### NOVO: `utils/haptics.js`

Centralizar chamadas de haptics:

```js
import * as Haptics from 'expo-haptics';

export const haptic = {
  light:   () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium:  () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy:   () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error:   () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  select:  () => Haptics.selectionAsync(),
};
```

#### MODIFICAR: `screens/CarrinhoScreen.js`

Adicionar haptics:
- `haptic.medium()` ao confirmar pedido com sucesso
- `haptic.error()` ao falhar biometria
- `haptic.light()` ao aplicar cupom
- `haptic.select()` ao selecionar endereço/pagamento

### Mapa de Interações com Haptic

| Interação | Haptic |
|-----------|--------|
| Adicionar item ao carrinho | `light` |
| Remover item do carrinho | `select` |
| Confirmar pedido (sucesso) | `medium` + `success` |
| Confirmar pedido (falha) | `error` |
| Aplicar cupom (sucesso) | `success` |
| Aplicar cupom (erro) | `error` |
| Swipe-to-delete | `light` |
| Selecionar endereço/pagamento | `select` |
| Pull-to-refresh | `medium` |
| Abrir bottom sheet | `select` |
| Biometria iniciar | `light` |
| Login/Cadastro sucesso | `success` |
| Login/Cadastro erro | `error` |

### Requisitos Técnicos

- `react-native-reanimated` 4.1.1 — já instalado
- `expo-haptics` — instalado pelo AGENT 05, se não, instalar: `npx expo install expo-haptics`
- `CardStyleInterpolators` — já disponível em `@react-navigation/stack`

### Critérios de Entrega

- [ ] Transições slide horizontal em todas as telas do Stack
- [ ] Stepper com números animados (slide-up ao incrementar, slide-down ao decrementar)
- [ ] Botão biométrico com shimmer sutil enquanto visível
- [ ] Pull-to-refresh com cores do tema ou ícone girando
- [ ] Haptic feedback em pelo menos 8 interações do app
- [ ] `utils/haptics.js` criado com helpers centralizados
- [ ] Skeleton shimmer visível em todas as listas de carregamento
- [ ] Animações não quebram scroll ou navegação
- [ ] Performance: animações com `useNativeDriver: true` sempre que possível

### Não Faça

- **Não use `LayoutAnimation`** — use apenas Reanimated ou Animated core
- **Não anime transições de tab** — só Stack
- **Não crie animações complexas demais** que possam causar jank em dispositivos reais
- **Não adicione haptics em cada letra digitada** — só em ações significativas
- **Não modifique a lógica de negócio** — apenas adicione animações e haptics
