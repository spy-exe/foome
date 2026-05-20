# AGENT 05 — UI/UX Login e Cadastro
## Foome — Spec de Desenvolvimento

### Contexto

As telas de Login e Cadastro existem e funcionam, mas precisam de polimento mobile-first. Problemas atuais:

**LoginScreen:**
- Sem validação inline (campos não mostram borda vermelha + mensagem de erro)
- Botão biométrico sem animação de pulso/loading
- Layout básico sem refinamentos de micro-interação
- Sem feedback tátil nos botões

**CadastroScreen:**
- Sem indicador de progresso entre etapas (form → câmera → preview)
- Sem validação inline em tempo real
- Preview de foto sem overlay de enquadramento profissional
- Navegação entre etapas sem animação

### Objetivo

1. LoginScreen com validação inline, animações, e feedback tátil
2. CadastroScreen com progress bar animada, validação em tempo real, e overlay de câmera melhorado
3. `KeyboardAvoidingView` em todos os formulários
4. `expo-haptics` para feedback tátil em erros e sucessos

### Git Workflow

```bash
git checkout main
git pull origin main
git checkout -b feat/agent-05-auth-ui

git add .
git commit -m "feat(login): adicionar validação inline e animações na LoginScreen"
# feat(cadastro): implementar progress bar animada e validação em tempo real
# feat(haptics): adicionar feedback tátil em erros e sucessos
# style(login): refinar layout mobile-first do fluxo de auth

git push origin feat/agent-05-auth-ui
```

**Regras:**
- Mínimo 3 commits
- Nunca commitar direto na `main`
- Nunca fazer push forçado

### Arquivos a Modificar / Criar

#### Instalar dependência

```bash
npx expo install expo-haptics
```

#### MODIFICAR: `screens/LoginScreen.js`

**Validação inline:**

Adicionar estado para erros:
```js
const [erros, setErros] = useState({ email: '', senha: '' });
```

Função de validação:
```js
function validar() {
  const e = {};
  if (!email.trim()) e.email = 'Informe seu e-mail';
  else if (!email.includes('@')) e.email = 'E-mail inválido';
  if (!senha.trim()) e.senha = 'Informe sua senha';
  setErros(e);
  return Object.keys(e).length === 0;
}
```

InputField com estado de erro — o componente `InputField.js` precisa ser modificado para aceitar prop `erro`:

#### MODIFICAR: `components/InputField.js`

Adicionar prop `erro`:
```js
export default function InputField({ icon, rightElement, erro, style, ...props }) {
  return (
    <View>
      <View style={[s.wrap, erro && s.wrapErro, style]}>
        {icon && <View style={s.iconSlot}>{icon}</View>}
        <TextInput
          style={s.input}
          placeholderTextColor={C.ink4}
          {...props}
        />
        {rightElement || null}
      </View>
      {erro ? <Text style={s.erroTxt}>{erro}</Text> : null}
    </View>
  );
}

// No StyleSheet:
// wrapErro: { borderColor: C.brand, borderWidth: 1.5 }
// erroTxt: { fontFamily: F.medium, fontSize: 11, color: C.brand, marginTop: 4, marginLeft: 4 }
```

**Botão biométrico com animação:**

```jsx
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

function BioButton({ onPress, usuario }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    // Animação de pulso contínua quando usuário existe
    if (usuario) {
      pulse.value = withRepeat(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [usuario]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View style={pulseStyle}>
      <TouchableOpacity
        style={s.bioBtn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        activeOpacity={0.8}
      >
        {/* ... ícone e textos ... */}
      </TouchableOpacity>
    </Animated.View>
  );
}
```

**Botão "Entrar" com loading:**
```jsx
const [loading, setLoading] = useState(false);

async function handleLogin() {
  if (!validar()) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    return;
  }
  setLoading(true);
  try {
    await loginComSenha();
  } finally {
    setLoading(false);
  }
}
```

**Layout refinado:**
- Logo centralizado com sombra sutil
- Campos com `autoFocus` no primeiro campo
- Espaçamento consistente (usar múltiplos de 4px: 12, 16, 20, 24)
- Card de boas-vindas com borda animada (já existe, manter estrutura)

#### MODIFICAR: `screens/CadastroScreen.js`

**Progress bar animada:**

```jsx
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

function ProgressBar({ etapa }) {
  // etapa: 'form' = 0, 'camera' = 1, 'preview' = 2
  const etapas = ['form', 'camera', 'preview'];
  const idx = etapas.indexOf(etapa);
  const progresso = (idx + 1) / 3;
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progresso, { duration: 400 });
  }, [etapa]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={s.progressBar}>
      <Animated.View style={[s.progressFill, barStyle]} />
    </View>
  );
}
```

Estilos da progress bar:
```js
progressBar: {
  height: 4,
  backgroundColor: C.border,
  borderRadius: 2,
  marginBottom: 24,
  overflow: 'hidden',
},
progressFill: {
  height: '100%',
  backgroundColor: C.brand,
  borderRadius: 2,
},
```

Indicador de etapas (texto):
```jsx
<Text style={s.etapaLabel}>Etapa {idx + 1} de 3</Text>
<ProgressBar etapa={etapa} />
```

**Validação em tempo real:**

Adicionar estado de erros e validar no `onChangeText`:
```js
const [erros, setErros] = useState({ nome: '', email: '', senha: '' });

function validarCampo(campo, valor) {
  switch (campo) {
    case 'nome':
      return valor.trim().length < 3 ? 'Nome muito curto' : '';
    case 'email':
      return !valor.includes('@') ? 'E-mail inválido' : '';
    case 'senha':
      return valor.length < 6 ? 'Mínimo 6 caracteres' : '';
    default:
      return '';
  }
}

// No InputField de nome:
<InputField
  // ...
  erro={erros.nome}
  onChangeText={(v) => {
    setNome(v);
    setErros(prev => ({ ...prev, nome: validarCampo('nome', v) }));
  }}
/>
```

**Câmera com overlay melhorado:**

O overlay atual é um círculo simples. Melhorar com:
- Cantos arredondados no overlay (máscara)
- Texto de instrução mais visível
- Animação de fade-in ao abrir a câmera

```jsx
// Overlay com borda oval estilizada
<View style={s.camOverlay}>
  <View style={s.camMask}>
    <View style={s.camFrame}>
      {/* Cantos decorativos */}
      <View style={[s.camCorner, s.camCornerTL]} />
      <View style={[s.camCorner, s.camCornerTR]} />
      <View style={[s.camCorner, s.camCornerBL]} />
      <View style={[s.camCorner, s.camCornerBR]} />
    </View>
  </View>
  <Text style={s.camHint}>Centralize seu rosto</Text>
</View>
```

**Preview melhorado:**
- Foto em círculo com borda brand
- Animação de scale-in ao aparecer
- Botão "Usar esta foto" com check animado
- Botão "Tirar novamente" estilizado como link

#### Haptics em ambos os formulários

```js
import * as Haptics from 'expo-haptics';

// Ao focar em campo com erro:
Haptics.selectionAsync(); // feedback leve

// Ao submeter com erro:
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

// Ao submeter com sucesso:
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Ao pressionar botão de biometria:
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
```

### Requisitos Técnicos

- `expo-haptics` — instalar via `npx expo install expo-haptics`
- `react-native-reanimated` 4.1.1 — já instalado
- Manter compatibilidade com o AppContext do AGENT 01
- Manter as funções de autenticação do AGENT 02 (`services/auth.js`)

### Critérios de Entrega

**LoginScreen:**
- [ ] Validação inline: borda vermelha + mensagem abaixo do campo com erro
- [ ] Botão biométrico com animação de pulso (Reanimated)
- [ ] Botão "Entrar" com estado de loading (ActivityIndicator)
- [ ] Link "Esqueci a senha?" funcional
- [ ] Haptic feedback ao errar/sucesso
- [ ] KeyboardAvoidingView em todos os cenários

**CadastroScreen:**
- [ ] Progress bar animada entre etapas (form → câmera → preview)
- [ ] Validação em tempo real nos campos (ao digitar, não só no submit)
- [ ] Overlay de câmera com cantos decorativos e texto centralizado
- [ ] Preview com borda brand e animação de entrada
- [ ] Haptic feedback em todas as interações
- [ ] Foto obrigatória validada ANTES de submeter

**Geral:**
- [ ] `InputField.js` com prop `erro` para borda vermelha + mensagem
- [ ] `PrimaryButton.js` com prop `loading` para estado de carregamento
- [ ] Todos os touch targets ≥ 44px
- [ ] KeyboardAvoidingView com behavior correto por plataforma

### Exemplos e Referências

Cores de estado para validação:
- Erro: `C.brand` (#E8452C) — borda e texto
- Sucesso: `C.teal` (#00BE99)
- Placeholder: `C.ink4` (#C8C8DC)

Haptics disponíveis:
```js
Haptics.impactAsync(style)       // Light, Medium, Heavy
Haptics.notificationAsync(type)  // Success, Warning, Error
Haptics.selectionAsync()         // feedback leve de seleção
```

### Não Faça

- **Não mude a lógica de autenticação** — use `services/auth.js` do AGENT 02
- **Não mude a estrutura de navegação** — use o que AGENT 01 e 04 definiram
- **Não crie componentes de formulário novos** — modifique `InputField.js` e `PrimaryButton.js` existentes
- **Não remova o fluxo de câmera** — mantenha as 3 etapas (form, câmera, preview)
- **Não altere o fluxo de biometria** — apenas melhore a UI
