# AGENT 01 — Arquitetura de Estado Global
## Foome — Spec de Desenvolvimento

### Contexto

O Foome atualmente **não tem gerenciamento de estado global**. Todo dado trafega via `route.params`:
- `LoginScreen` → `navigation.replace('App', { usuario })`
- `HomeScreen` → lê `route.params.usuario`
- `RestauranteScreen` → gerencia `carrinho` com `useState` local → passa para `CarrinhoScreen` via `route.params`
- `CarrinhoScreen`, `PedidosScreen`, `MapaScreen` → todas leem `usuario` de `route.params`

Isso é frágil: se uma tela esquecer de passar `usuario`, a tela seguinte recebe `undefined`. Além disso, o carrinho some se o usuário der back da CarrinhoScreen.

O Stack Navigator em `App.js` tem **2 rotas duplicadas** apontando pro mesmo componente:
```jsx
<Stack.Screen name="App"  component={HomeScreen} />
<Stack.Screen name="Home" component={HomeScreen} />
```
Isso causa ambiguidade — algumas telas navegam pra `'App'`, outras pra `'Home'`.

### Objetivo

1. Criar `contexts/AppContext.js` — estado do usuário autenticado (nome, email, fotoUri, logado)
2. Criar `contexts/CarrinhoContext.js` — itens, total, restaurante ativo
3. Eliminar TODA passagem de `usuario` e `carrinho` por `route.params`
4. Resolver as rotas duplicadas App/Home — manter só `Home` e ajustar todas as navegações
5. Garantir que o carrinho sobreviva à navegação (ir e voltar da CarrinhoScreen não zera o carrinho)

### Git Workflow

```bash
# 1. Antes de começar — criar e entrar na branch
git checkout main
git pull origin main
git checkout -b feat/agent-01-state

# 2. Durante o trabalho — commitar a cada entrega significativa
git add .
git commit -m "feat(state): implementar AppContext com useReducer para usuário"
# Exemplos:
# feat(state): implementar CarrinhoContext com ações add/remove/clear
# refactor(screens): migrar HomeScreen para usar AppContext em vez de route.params
# refactor(nav): remover rota duplicada App, manter só Home

# 3. Ao finalizar — push da branch
git push origin feat/agent-01-state
```

**Regras:**
- Mínimo 3 commits
- Nunca commitar direto na `main`
- Nunca fazer push forçado
- Usar conventional commits: `feat(state):`, `refactor(nav):`, `fix(state):`

### Arquivos a Modificar / Criar

#### NOVO: `contexts/AppContext.js`
```jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getUsuario, removerUsuario } from '../services/storage';

const AppContext = createContext(null);

const initialState = {
  usuario: null,      // { nome, email, senha, fotoUri, criadoEm } ou null
  carregando: true,   // true enquanto verifica AsyncStorage
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, usuario: action.payload, carregando: false };
    case 'LOGOUT':
      return { ...state, usuario: null, carregando: false };
    case 'CARREGADO':
      return { ...state, usuario: action.payload, carregando: false };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    getUsuario().then(u => dispatch({ type: 'CARREGADO', payload: u }));
  }, []);

  const login = (usuario) => dispatch({ type: 'LOGIN', payload: usuario });
  const logout = async () => {
    await removerUsuario();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AppContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}
```

#### NOVO: `contexts/CarrinhoContext.js`
```jsx
import React, { createContext, useContext, useReducer } from 'react';

const CarrinhoContext = createContext(null);

const initialState = {
  itens: [],            // [{ id, nome, preco, emoji, qtd }, ...]
  restaurante: null,    // restaurante ativo (objeto completo de RESTAURANTES)
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADICIONAR': {
      const existe = state.itens.find(i => i.id === action.payload.id);
      if (existe) {
        return {
          ...state,
          itens: state.itens.map(i =>
            i.id === action.payload.id ? { ...i, qtd: i.qtd + 1 } : i
          ),
        };
      }
      return {
        ...state,
        itens: [...state.itens, { ...action.payload, qtd: 1 }],
      };
    }
    case 'REMOVER': {
      const item = state.itens.find(i => i.id === action.payload);
      if (!item) return state;
      if (item.qtd === 1) {
        return { ...state, itens: state.itens.filter(i => i.id !== action.payload) };
      }
      return {
        ...state,
        itens: state.itens.map(i =>
          i.id === action.payload ? { ...i, qtd: i.qtd - 1 } : i
        ),
      };
    }
    case 'SET_RESTAURANTE':
      return { ...state, restaurante: action.payload };
    case 'LIMPAR':
      return initialState;
    default:
      return state;
  }
}

export function CarrinhoProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const adicionar = (produto) => dispatch({ type: 'ADICIONAR', payload: produto });
  const remover = (id) => dispatch({ type: 'REMOVER', payload: id });
  const setRestaurante = (r) => dispatch({ type: 'SET_RESTAURANTE', payload: r });
  const limpar = () => dispatch({ type: 'LIMPAR' });
  const totalItens = state.itens.reduce((s, i) => s + i.qtd, 0);
  const totalPreco = state.itens.reduce((s, i) => s + i.preco * i.qtd, 0);

  return (
    <CarrinhoContext.Provider value={{
      ...state, adicionar, remover, setRestaurante, limpar, totalItens, totalPreco,
    }}>
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  const ctx = useContext(CarrinhoContext);
  if (!ctx) throw new Error('useCarrinho deve ser usado dentro de CarrinhoProvider');
  return ctx;
}
```

#### MODIFICAR: `App.js`
1. Importar `AppProvider` e `CarrinhoProvider`
2. Envolver o `NavigationContainer` com ambos os providers
3. Remover a rota duplicada `App` — manter só `Home`
4. Adicionar lógica de tela inicial condicional: se `usuario` existe → `Home`, senão → `Login`
5. Criar `AppNavigator` separado do `AuthNavigator` (ou usar condicional no children do Stack.Navigator)

```jsx
// Estrutura sugerida para App.js:
import { AppProvider, useApp } from './contexts/AppContext';
import { CarrinhoProvider } from './contexts/CarrinhoContext';

function RootNavigator() {
  const { usuario, carregando } = useApp();

  if (carregando) return null; // ou um SplashScreen

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
      {usuario ? (
        <>
          <Stack.Screen name="Home"        component={HomeScreen} />
          <Stack.Screen name="Restaurante" component={RestauranteScreen} />
          <Stack.Screen name="Carrinho"    component={CarrinhoScreen} />
          <Stack.Screen name="Pedidos"     component={PedidosScreen} />
          <Stack.Screen name="Mapa"        component={MapaScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login"    component={LoginScreen} />
          <Stack.Screen name="Cadastro" component={CadastroScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  // ... font loading como antes
  return (
    <AppProvider>
      <CarrinhoProvider>
        <View style={{ flex: 1 }} onLayout={onReady}>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </View>
      </CarrinhoProvider>
    </AppProvider>
  );
}
```

#### MODIFICAR: `screens/LoginScreen.js`
1. Importar `useApp` de `../contexts/AppContext`
2. Remover `const [usuario, setUsuario] = useState(null)` e o `useEffect` com `getUsuario()`
3. Substituir por `const { usuario, login } = useApp()`
4. Em `loginComBiometria()`: ao autenticar, chamar `login(usuario)` em vez de `navigation.replace('App', { usuario })`
5. Em `loginComSenha()`: chamar `login(usuario)` — a navegação acontece automaticamente porque `RootNavigator` reage ao estado
6. Remover `route.params` — não recebe mais nada
7. Ajustar navegação: onde navega pra `'App'`, agora navega pra `'Home'` (se ainda precisar de navegação manual dentro do fluxo condicional, use `navigation.reset`)

**Importante:** Como o `RootNavigator` condicional troca as telas automaticamente quando `usuario` muda, ao chamar `login(usuario)` o navigator renderiza as telas autenticadas. Não precisa de `navigation.replace`.

#### MODIFICAR: `screens/HomeScreen.js`
1. Importar `useApp` e `useCarrinho`
2. Remover `const usuario = route?.params?.usuario || {}`
3. Substituir por `const { usuario } = useApp()`
4. Todas as navegações param de passar `usuario`: `navigation.navigate('Restaurante', { restaurante: rest })` (sem usuario)
5. `navigation.navigate('Mapa')` (sem usuario)

#### MODIFICAR: `screens/RestauranteScreen.js`
1. Importar `useCarrinho` de `../contexts/CarrinhoContext`
2. Remover `const [carrinho, setCarrinho] = useState([])` local
3. Remover funções `adicionar()`, `remover()`, `qtd()` locais
4. Usar `const { adicionar, remover, totalItens, totalPreco, itens, setRestaurante } = useCarrinho()`
5. No `useEffect` ou no corpo: chamar `setRestaurante(restaurante)` assim que a tela montar
6. Função `qtd(id)` vira: `const qtd = (id) => itens.find(i => i.id === id)?.qtd ?? 0`
7. Na navegação pro carrinho: `navigation.navigate('Carrinho')` (sem params!)
8. `route.params` só precisa de `restaurante` (vem da HomeScreen)

#### MODIFICAR: `screens/CarrinhoScreen.js`
1. Importar `useApp` e `useCarrinho`
2. Remover `const { carrinho, restaurante, usuario } = route.params`
3. Usar `const { itens, restaurante, totalPreco, totalItens, limpar } = useCarrinho()`
4. `const { usuario } = useApp()`
5. `subtotal` e `total` calculados a partir de `itens` (já expostos pelo context)
6. Após confirmar pedido: chamar `limpar()` para resetar o carrinho
7. `taxaEntrega` calculado a partir de `restaurante.entrega`

#### MODIFICAR: `screens/PedidosScreen.js`
1. Importar `useApp`
2. Remover `const usuario = route?.params?.usuario || {}`
3. Usar `const { usuario } = useApp()`
4. Navegação pra Home: `navigation.navigate('Home')` (sem usuario)

#### MODIFICAR: `screens/MapaScreen.js`
1. Importar `useApp` e `useCarrinho`
2. Remover `const usuario = route?.params?.usuario || {}`
3. Usar `const { usuario } = useApp()`
4. Navegação: `navigation.navigate('Restaurante', { restaurante: selecionado })` (sem usuario)
5. Chamar `setRestaurante(selecionado)` antes de navegar

### Requisitos Técnicos

- **Nenhuma dependência nova.** Context API + useReducer já fazem parte do React 19.
- Se durante a implementação perceber que Context + useReducer está ficando muito verboso com muitos arquivos tocando o mesmo estado, **pode migrar para Zustand** (`npm install zustand`). Zustand é mais enxuto e evita re-renders desnecessários.
- Não usar Redux — overkill total.
- O carrinho NÃO persiste no AsyncStorage (só os pedidos confirmados persistem). Carrinho é volátil.

### Critérios de Entrega

- [ ] `contexts/AppContext.js` criado e funcional
- [ ] `contexts/CarrinhoContext.js` criado e funcional
- [ ] `App.js` com providers e sem rota duplicada App/Home
- [ ] `LoginScreen.js` sem `route.params` e sem `useState` para usuario
- [ ] `HomeScreen.js` sem `route.params.usuario`
- [ ] `RestauranteScreen.js` sem useState local para carrinho
- [ ] `CarrinhoScreen.js` sem `route.params` para carrinho/usuario
- [ ] `PedidosScreen.js` sem `route.params.usuario`
- [ ] `MapaScreen.js` sem `route.params.usuario`
- [ ] Navegação condicional funcionando: sem usuário → Login, com usuário → Home
- [ ] Carrinho sobrevive a ir e voltar (navegar Restaurante → Carrinho → voltar → itens mantidos)
- [ ] Limpar carrinho após confirmar pedido funciona
- [ ] Zero crashes ao navegar entre qualquer combinação de telas

### Exemplos e Referências

Pattern do `useApp()` hook:
```jsx
// Em qualquer tela:
const { usuario, login, logout } = useApp();
// usuario é { nome, email, senha, fotoUri, criadoEm } ou null
```

Pattern do `useCarrinho()` hook:
```jsx
const { itens, restaurante, adicionar, remover, limpar, totalItens, totalPreco, setRestaurante } = useCarrinho();
// adicionar(produto) — produto é o objeto completo do produto
// remover(id) — id do produto (string)
// setRestaurante(restaurante) — objeto completo do restaurante
```

### Não Faça

- **Não persista o carrinho no AsyncStorage** — carrinho é estado volátil, persista só pedidos confirmados
- **Não mexa em `services/storage.js`** — o AGENT 02 vai lidar com segurança
- **Não altere a UI das telas** — seu foco é estado e navegação, a UI fica para os AGENTS 05-13
- **Não crie telas novas** — nenhuma
- **Não instale Redux**
- **Não mude a assinatura das funções em `services/`** — outros agentes dependem delas
