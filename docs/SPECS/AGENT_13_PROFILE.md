# AGENT 13 — Tela de Perfil e Dark Mode
## Foome — Spec de Desenvolvimento

### Contexto

O app não tem tela de perfil. O placeholder criado pelo AGENT 04 (`screens/PerfilScreen.js`) é mínimo ("Em breve..."). O app também não tem suporte a dark mode — `userInterfaceStyle` está fixo como `"light"` no `app.json`.

Funcionalidades esperadas:
- Ver/editar foto, nome, email do usuário
- Alterar senha
- Endereços salvos (CRUD mock)
- Toggle Dark Mode
- Toggle Notificações (mock)
- Botão de logout

### Objetivo

1. Criar `screens/PerfilScreen.js` completo com UI rica
2. Implementar `ThemeContext` para light/dark mode
3. Integrar dark mode ao sistema de temas existente
4. Modal de alteração de senha com validação + hash
5. CRUD de endereços mockados
6. Botão de logout com confirmação → chama `logout()` do AGENT 02

### Git Workflow

```bash
git checkout main
git pull origin main
git checkout -b feat/agent-13-profile

git add .
git commit -m "feat(profile): criar PerfilScreen com exibição de dados do usuário"
# feat(theme): implementar ThemeContext e dark mode via useColorScheme
# feat(profile): adicionar modal de alterar senha e CRUD de endereços
# feat(profile): implementar logout com Alert de confirmação

git push origin feat/agent-13-profile
```

**Regras:**
- Mínimo 3 commits
- Nunca commitar direto na `main`
- Nunca fazer push forçado

### Arquivos a Modificar / Criar

#### NOVO: `contexts/ThemeContext.js`

```jsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { C as lightColors } from '../constants/theme';

// Dark mode colors — mapeamento sobre as cores claras
const darkColors = {
  brand:       '#E8452C',  // brand não muda
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
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [modo, setModo] = useState(null); // null = usar sistema, 'light', 'dark'

  // Carregar preferência salva
  useEffect(() => {
    AsyncStorage.getItem('@foome_tema').then(v => {
      if (v === 'dark' || v === 'light') setModo(v);
      else setModo(null);
    });
  }, []);

  const isDark = modo === 'dark' || (modo === null && systemScheme === 'dark');
  const C = isDark ? darkColors : lightColors;

  async function toggle() {
    const novo = isDark ? 'light' : 'dark';
    setModo(novo);
    await AsyncStorage.setItem('@foome_tema', novo);
  }

  async function reset() {
    setModo(null);
    await AsyncStorage.removeItem('@foome_tema');
  }

  const value = useMemo(() => ({
    C,
    isDark,
    modo: isDark ? 'dark' : 'light',
    toggle,
    reset,
  }), [isDark, C]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx;
}
```

#### MODIFICAR: `App.js`

Envolver o app com `ThemeProvider`:

```jsx
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  // ...
  return (
    <ThemeProvider>
      <AppProvider>
        <CarrinhoProvider>
          {/* ... */}
        </CarrinhoProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
```

#### MODIFICAR: `constants/theme.js`

Tornar as cores adaptáveis ao tema. A maneira mais simples: exportar uma função que recebe `isDark`:

```js
// NO FINAL do theme.js, adicionar:
export function getTheme(isDark) {
  if (!isDark) return { C, F, SHADOW, SPACING, RADIUS, ANIM, HAPTIC };
  return {
    C: {
      brand: '#E8452C', brandDark: '#C23525', brandLight: '#2A1513', brandBorder: '#4A2020',
      ink: '#F0F0F7', ink2: '#C8C8DC', ink3: '#9494B2', ink4: '#6A6A82',
      bg: '#12121A', surface: '#1E1E2A', border: '#2A2A3A',
      amber: '#FF9B3D', amberLight: '#2A2018', teal: '#00BE99', tealLight: '#182A24',
    },
    F, SHADOW, SPACING, RADIUS, ANIM, HAPTIC,
  };
}
```

Na prática, o `ThemeContext` já fornece `C` correto (claro ou escuro). Os componentes usam `const { C } = useTheme()` em vez de `import { C } from '../constants/theme'`.

**IMPORTANTE:** Fazer isso em todos os componentes existentes seria um trabalho enorme e conflitaria com outros agentes. Uma abordagem mais pragmática: o `ThemeProvider` apenas fornece `{ C, isDark, toggle }` e os componentes que QUEREM suporte a dark mode importam de lá. Para não quebrar nada, mantenha `constants/theme.js` exportando as cores claras como default (C, F, SHADOW, etc.) e o `ThemeContext` como uma camada adicional para componentes que optam por usar.

**Abordagem pragmática (recomendada):**
- `PerfilScreen` e componentes novos usam `useTheme()`
- Componentes existentes continuam importando `C` diretamente de `constants/theme.js`
- Isso evita conflitos com agentes 01-12 que já estão modificando esses componentes

#### MODIFICAR: `screens/PerfilScreen.js`

Substituir o placeholder por uma tela completa:

```jsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Alert, Modal, TextInput, Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { auth } from '../services/auth';
import { C, F, SHADOW, RADIUS, SPACING } from '../constants/theme';
import Avatar from '../components/Avatar';
import PrimaryButton from '../components/PrimaryButton';

export default function PerfilScreen({ navigation }) {
  const { usuario, logout } = useApp();
  const { isDark, toggle } = useTheme();
  const { limpar } = useCarrinho();

  // Modal de alterar senha
  const [modalSenha, setModalSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Notificações (mock)
  const [notifAtiva, setNotifAtiva] = useState(true);

  // Endereços (mock CRUD)
  const [enderecos, setEnderecos] = useState([
    { id: '1', label: 'Casa', endereco: 'Rua das Acácias, 42 - Vassouras, RJ' },
    { id: '2', label: 'Trabalho', endereco: 'Av. Principal, 100 - Sala 302' },
  ]);
  const [novoEndereco, setNovoEndereco] = useState(false);

  async function handleLogout() {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair? Seus pedidos serão preservados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            limpar(); // limpar carrinho ao sair
            await logout(); // do AppContext, que chama removerUsuario
          },
        },
      ]
    );
  }

  async function alterarSenha() {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert('Senha curta', 'Mínimo 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      Alert.alert('Senhas diferentes', 'A nova senha e a confirmação não conferem.');
      return;
    }

    // Verificar senha atual
    const hashAtual = await hashSenha(senhaAtual);
    if (hashAtual !== usuario.senhaHash) {
      Alert.alert('Senha incorreta', 'A senha atual não confere.');
      return;
    }

    // Salvar nova senha
    const novoHash = await hashSenha(novaSenha);
    const usuarioAtualizado = { ...usuario, senhaHash: novoHash };
    await salvarUsuario(usuarioAtualizado);
    // Nota: como AppContext tem estado local, precisaríamos de um método updateUser.
    // Por simplicidade, recarregar do storage:
    Alert.alert('Sucesso', 'Senha alterada com sucesso!');
    setModalSenha(false);
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.surface} />

      {/* Header */}
      <View style={[s.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <Text style={[s.titulo, { color: C.ink }]}>Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Avatar + Nome */}
        <View style={s.profileTop}>
          <Avatar uri={usuario?.fotoUri} nome={usuario?.nome} tamanho="L" />
          <TouchableOpacity
            style={s.editAvatar}
            onPress={() => {
              Haptics.selectionAsync();
              navigation.navigate('Cadastro'); // ou abrir câmera direto
            }}
          >
            <Feather name="camera" size={14} color="#fff" />
          </TouchableOpacity>
          <Text style={[s.nome, { color: C.ink }]}>{usuario?.nome}</Text>
          <Text style={[s.email, { color: C.ink3 }]}>{usuario?.email}</Text>
        </View>

        {/* Seção: Preferências */}
        <Text style={[s.sectionLabel, { color: C.ink }]}>Preferências</Text>
        <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={s.row}>
            <View style={s.rowLeft}>
              <Feather name="moon" size={18} color={isDark ? C.amber : C.ink2} />
              <Text style={[s.rowLabel, { color: C.ink }]}>Modo escuro</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={() => {
                Haptics.selectionAsync();
                toggle();
              }}
              trackColor={{ false: C.border, true: C.brandLight }}
              thumbColor={isDark ? C.brand : C.ink4}
            />
          </View>

          <View style={[s.divider, { backgroundColor: C.border }]} />

          <View style={s.row}>
            <View style={s.rowLeft}>
              <Feather name="bell" size={18} color={C.ink2} />
              <Text style={[s.rowLabel, { color: C.ink }]}>Notificações</Text>
            </View>
            <Switch
              value={notifAtiva}
              onValueChange={v => {
                Haptics.selectionAsync();
                setNotifAtiva(v);
              }}
              trackColor={{ false: C.border, true: C.brandLight }}
              thumbColor={notifAtiva ? C.brand : C.ink4}
            />
          </View>
        </View>

        {/* Seção: Endereços */}
        <Text style={[s.sectionLabel, { color: C.ink }]}>Endereços salvos</Text>
        <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          {enderecos.map((end, i) => (
            <View key={end.id}>
              <View style={s.row}>
                <View style={s.rowLeft}>
                  <Feather
                    name={end.label === 'Casa' ? 'home' : 'briefcase'}
                    size={18}
                    color={C.ink2}
                  />
                  <View>
                    <Text style={[s.rowLabel, { color: C.ink }]}>{end.label}</Text>
                    <Text style={[s.rowSub, { color: C.ink3 }]}>{end.endereco}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    setEnderecos(prev => prev.filter(e => e.id !== end.id));
                  }}
                >
                  <Feather name="x" size={16} color={C.ink4} />
                </TouchableOpacity>
              </View>
              {i < enderecos.length - 1 && <View style={[s.divider, { backgroundColor: C.border }]} />}
            </View>
          ))}
          <TouchableOpacity
            style={s.addRow}
            onPress={() => {
              Haptics.selectionAsync();
              Alert.prompt
                ? Alert.prompt('Novo endereço', 'Rua e número:', text => {
                    if (text) setEnderecos(prev => [...prev, { id: Date.now().toString(), label: 'Outro', endereco: text }]);
                  })
                : setEnderecos(prev => [...prev, { id: Date.now().toString(), label: 'Novo', endereco: 'Novo endereço' }]);
            }}
          >
            <Feather name="plus" size={18} color={C.brand} />
            <Text style={[s.addTxt, { color: C.brand }]}>Adicionar endereço</Text>
          </TouchableOpacity>
        </View>

        {/* Seção: Segurança */}
        <Text style={[s.sectionLabel, { color: C.ink }]}>Segurança</Text>
        <TouchableOpacity
          style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}
          onPress={() => setModalSenha(true)}
        >
          <View style={s.row}>
            <View style={s.rowLeft}>
              <Feather name="lock" size={18} color={C.ink2} />
              <Text style={[s.rowLabel, { color: C.ink }]}>Alterar senha</Text>
            </View>
            <Feather name="chevron-right" size={18} color={C.ink4} />
          </View>
        </TouchableOpacity>

        {/* Botão Logout */}
        <TouchableOpacity
          style={s.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={18} color={C.brand} />
          <Text style={s.logoutTxt}>Sair da conta</Text>
        </TouchableOpacity>

        <View style={{ height: 48 }} />
      </ScrollView>

      {/* Modal Alterar Senha */}
      <Modal visible={modalSenha} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { backgroundColor: C.surface }]}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: C.ink }]}>Alterar senha</Text>
              <TouchableOpacity onPress={() => setModalSenha(false)}>
                <Feather name="x" size={22} color={C.ink3} />
              </TouchableOpacity>
            </View>

            <Text style={[s.inputLabel, { color: C.ink3 }]}>SENHA ATUAL</Text>
            <TextInput
              style={[s.modalInput, { backgroundColor: C.bg, borderColor: C.border, color: C.ink }]}
              placeholder="••••••••"
              placeholderTextColor={C.ink4}
              secureTextEntry
              value={senhaAtual}
              onChangeText={setSenhaAtual}
            />

            <Text style={[s.inputLabel, { color: C.ink3 }]}>NOVA SENHA</Text>
            <TextInput
              style={[s.modalInput, { backgroundColor: C.bg, borderColor: C.border, color: C.ink }]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={C.ink4}
              secureTextEntry
              value={novaSenha}
              onChangeText={setNovaSenha}
            />

            <Text style={[s.inputLabel, { color: C.ink3 }]}>CONFIRMAR NOVA SENHA</Text>
            <TextInput
              style={[s.modalInput, { backgroundColor: C.bg, borderColor: C.border, color: C.ink }]}
              placeholder="Repita a nova senha"
              placeholderTextColor={C.ink4}
              secureTextEntry
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />

            <PrimaryButton label="Salvar nova senha" onPress={alterarSenha} style={{ marginTop: SPACING.xl }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// StyleSheet completo usando C, F, SPACING, RADIUS
```

### Requisitos Técnicos

- `expo-haptics` — instalado pelo AGENT 05
- `@react-native-async-storage/async-storage` — já instalado
- `useColorScheme()` do React Native para detectar preferência do sistema
- `Switch` componente nativo do React Native
- `Modal` componente nativo do React Native

### Critérios de Entrega

- [ ] `contexts/ThemeContext.js` com suporte a light/dark/sistema
- [ ] Toggle de dark mode funcional (Switch no Perfil)
- [ ] `App.js` com ThemeProvider
- [ ] PerfilScreen com avatar, nome, email
- [ ] Botão de editar foto funcional (navega ou abre câmera)
- [ ] Modal de alterar senha com 3 campos + validação
- [ ] Senha alterada com hash (usar hashSenha do AGENT 02)
- [ ] Lista de endereços mockada com remover (CRUD mock)
- [ ] Botão "Adicionar endereço" funcional (simples)
- [ ] Toggle de notificações (mock, não precisa implementar push)
- [ ] Botão de logout com Alert de confirmação
- [ ] Logout chama `logout()` do AppContext e `limpar()` do CarrinhoContext
- [ ] Tema escuro aplicado na PerfilScreen

### Exemplos e Referências

Paleta dark mode:
```
ink (texto principal):  #F0F0F7
ink2 (secundário):     #C8C8DC
ink3 (placeholder):    #9494B2
bg (fundo):            #12121A
surface (cards):       #1E1E2A
border:                #2A2A3A
```

### Não Faça

- **Não converta todas as telas para usar `useTheme()`** — apenas a PerfilScreen e o ThemeContext
- **Não mude a estrutura do `constants/theme.js`** — mantenha exports C, F, SHADOW como estão
- **Não implemente push notifications** — toggle é mock
- **Não crie backend de alteração de senha** — hash e AsyncStorage local
- **Não crie múltiplas contas de usuário** — o app é single-user
- **Não implemente upload de foto** — câmera já existe no CadastroScreen
