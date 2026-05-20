# AGENT 04 — Navegação com Bottom Tabs
## Foome — Spec de Desenvolvimento

### Contexto

O app usa apenas Stack Navigator (`createStackNavigator`), com TODAS as telas empilhadas linearmente. O `@react-navigation/bottom-tabs` (v7.15.9) está **instalado mas não utilizado**.

Problemas atuais:
- Não há acesso direto a Home, Mapa, Pedidos — o usuário precisa navegar linearmente
- Não há tab bar visível — o usuário não sabe quais seções existem
- Não há badge de contagem de pedidos
- Headers são manuais em cada tela — não usam o header do navigator

### Objetivo

1. Criar **Bottom Tab Navigator** com 4 tabs: Home, Mapa, Pedidos, Perfil
2. Aninhar **Stack Navigator** dentro da tab Home para o fluxo Restaurante → Carrinho
3. **Badge animado** na tab Pedidos mostrando contagem de pedidos do Context
4. Usar `@expo/vector-icons` (já disponível no Expo) para ícones das tabs
5. Headers consistentes e configurados no navigator, não manualmente

### Git Workflow

```bash
git checkout main
git pull origin main
git checkout -b feat/agent-04-navigation

git add .
git commit -m "feat(nav): implementar Bottom Tab Navigator com 4 tabs"
# feat(nav): aninhar Stack Navigator na tab Home para fluxo Restaurante
# feat(nav): adicionar badge animado na tab Pedidos
# refactor(nav): configurar headers centralizados no navigator

git push origin feat/agent-04-navigation
```

**Regras:**
- Mínimo 3 commits
- Nunca commitar direto na `main`
- Nunca fazer push forçado

### Arquivos a Modificar / Criar

#### NOVO: `navigation/TabNavigator.js`

```jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { useApp } from '../contexts/AppContext';
import { C, F } from '../constants/theme';

import HomeStack from './HomeStack';
import MapaScreen from '../screens/MapaScreen';
import PedidosScreen from '../screens/PedidosScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { totalItens } = useCarrinho();
  const { usuario } = useApp();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.brand,
        tabBarInactiveTintColor: C.ink3,
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
        tabBarLabelStyle: {
          fontFamily: F.medium,
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MapaTab"
        component={MapaScreen}
        options={{
          tabBarLabel: 'Mapa',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PedidosTab"
        component={PedidosScreen}
        options={{
          tabBarLabel: 'Pedidos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
          // Badge via tabBarBadge e tabBarBadgeStyle
          // Nota: @react-navigation/bottom-tabs v7 suporta função para tabBarIcon
          // Para badge customizado animado, usar tabBarButton customizado:
        }}
      />
      <Tab.Screen
        name="PerfilTab"
        component={PerfilScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
```

**IMPORTANTE:** Se o `PerfilScreen` ainda não existir (será criado pelo AGENT 13), crie um placeholder mínimo:

```jsx
// screens/PerfilScreen.js (placeholder)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, F } from '../constants/theme';

export default function PerfilScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontFamily: F.heading, fontSize: 18, color: C.ink }}>Perfil</Text>
      <Text style={{ fontFamily: F.regular, fontSize: 14, color: C.ink3, marginTop: 4 }}>
        Em breve...
      </Text>
    </View>
  );
}
```

#### NOVO: `navigation/HomeStack.js`

Stack Navigator aninhado dentro da tab Home:

```jsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import RestauranteScreen from '../screens/RestauranteScreen';
import CarrinhoScreen from '../screens/CarrinhoScreen';

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Restaurante" component={RestauranteScreen} />
      <Stack.Screen name="Carrinho" component={CarrinhoScreen} />
    </Stack.Navigator>
  );
}
```

#### MODIFICAR: `App.js`

Substituir o `RootNavigator` atual pelo `TabNavigator`:

```jsx
import TabNavigator from './navigation/TabNavigator';

function RootNavigator() {
  const { usuario, carregando } = useApp();

  if (carregando) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {usuario ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Cadastro" component={CadastroScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
```

Nota: O `PedidosScreen` agora é acessível pela tab. Remover a navegação manual para `'Pedidos'` de dentro de `CarrinhoScreen` — o alerta de confirmação deve apenas limpar o carrinho e voltar, o usuário acessa Pedidos pela tab.

Ajuste em `CarrinhoScreen.js` — após confirmar pedido:
```js
Alert.alert(
  'Pedido confirmado!',
  `${restaurante.nome} · ${formatarPreco(total)}`,
  [
    {
      text: 'OK',
      onPress: () => {
        limpar();
        navigation.goBack(); // volta pra Home
      },
    },
  ]
);
```

#### Navegação a partir do Mapa

Na `MapaScreen`, o botão "Ver cardápio" navega para `Restaurante`. Mas `MapaScreen` agora está numa tab separada, fora do `HomeStack`.

**Solução:** Navegar para a tab Home primeiro, depois para Restaurante:
```js
// No MapaScreen, ao clicar "Ver cardápio":
navigation.navigate('HomeTab', {
  screen: 'Restaurante',
  params: { restaurante: selecionado },
});
```

Isso funciona porque o `TabNavigator` está dentro do Stack principal. O React Navigation resolve a navegação aninhada automaticamente.

#### Badge na tab Pedidos

Para um badge animado, não usar `tabBarBadge` nativo. Em vez disso, criar um componente customizado:

```jsx
// navigation/TabBarIcon.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { usePedidosCount } from '../contexts/AppContext'; // ou onde estiver a contagem
import { C } from '../constants/theme';

export default function PedidosTabIcon({ color, size }) {
  const count = usePedidosCount(); // hook a ser criado ou usar getPedidos
  const scale = useSharedValue(1);

  // Animar quando count mudar
  useEffect(() => {
    scale.value = withSpring(1.3, {}, () => {
      scale.value = withSpring(1);
    });
  }, [count]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View>
      <Ionicons name="receipt-outline" size={size} color={color} />
      {count > 0 && (
        <Animated.View style={[s.badge, badgeStyle]}>
          <Text style={s.badgeTxt}>{count > 99 ? '99+' : count}</Text>
        </Animated.View>
      )}
    </View>
  );
}
```

Para a contagem, criar um hook simples ou usar `useFocusEffect`:

```jsx
// No AppContext ou em um hook separado
// Opção 1: state no AppContext
// Opção 2: ler do AsyncStorage direto na tab
```

Já que o AGENT 01 está criando `AppContext`, sugiro adicionar `pedidosCount` e `atualizarPedidosCount` ao contexto, ou simplesmente a `PedidosTabIcon` chamar `getPedidos()` com `useFocusEffect`.

### Requisitos Técnicos

- `@react-navigation/bottom-tabs` v7.15.9 — já instalado
- `@expo/vector-icons` — já disponível no Expo (Ionicons, MaterialCommunityIcons)
- Reanimated 4.1.1 — já instalado (para animação do badge)
- Compatível com AppContext e CarrinhoContext do AGENT 01

### Critérios de Entrega

- [ ] `navigation/TabNavigator.js` criado com 4 tabs
- [ ] `navigation/HomeStack.js` criado com Stack aninhado (Home → Restaurante → Carrinho)
- [ ] `App.js` atualizado para usar TabNavigator
- [ ] Badge na tab Pedidos mostra contagem de pedidos
- [ ] Badge anima (scale) quando a contagem muda
- [ ] Navegação do Mapa → Restaurante funciona via navigate aninhado
- [ ] Tabs com ícones corretos (home, map, receipt, person)
- [ ] Cores da tab bar seguem o tema (brand ativo, ink3 inativo)
- [ ] `PerfilScreen` placeholder criado se AGENT 13 ainda não existir
- [ ] Navegação `CarrinhoScreen` → confirmar → volta pra Home (não navega mais pra Pedidos)
- [ ] Zero crashes ao alternar entre tabs e navegar no Stack aninhado

### Exemplos e Referências

Ícones disponíveis no `@expo/vector-icons` (Ionicons):
- `home-outline` / `home` — Home
- `map-outline` / `map` — Mapa
- `receipt-outline` / `receipt` — Pedidos
- `person-outline` / `person` — Perfil

Navegação aninhada (React Navigation docs):
```
Stack (Root)
  ├── Login
  ├── Cadastro
  └── Main (TabNavigator)
        ├── HomeTab (HomeStack)
        │     ├── Home
        │     ├── Restaurante
        │     └── Carrinho
        ├── MapaTab (MapaScreen)
        ├── PedidosTab (PedidosScreen)
        └── PerfilTab (PerfilScreen)
```

### Não Faça

- **Não remova `@react-navigation/bottom-tabs` nem reinstale**
- **Não crie o PerfilScreen completo** — só placeholder (AGENT 13 fará a versão final)
- **Não modifique a lógica de negócio das telas** — só mude navegação
- **Não adicione mais de 4 tabs** — Home, Mapa, Pedidos, Perfil
- **Não use `tabBarBadge` nativo** — crie badge customizado com animação
- **Não altere os componentes de tela além de ajustes de navegação**
