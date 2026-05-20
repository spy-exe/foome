# AGENT 02 — Segurança e Auth
## Foome — Spec de Desenvolvimento

### Contexto

O app tem **3 problemas graves de segurança**:

1. **Senha em texto puro no AsyncStorage.** Em `CadastroScreen.js` linha 39:
   ```js
   await salvarUsuario({ nome, email, senha, fotoUri, criadoEm: new Date().toISOString() });
   ```
   A senha é armazenada sem hash. Qualquer um com acesso ao dispositivo pode ler.

2. **Sem logout real.** Não existe função de logout. O usuário "desloga" apenas fechando o app, mas `removerUsuario()` do `services/storage.js` nunca é chamado por tela nenhuma.

3. **Mensagens de erro genéricas.** Em `LoginScreen.js` linha 31-33:
   ```js
   if (email.trim() !== usuario.email || senha !== usuario.senha) {
     Alert.alert('Dados incorretos', 'E-mail ou senha inválidos.');
   }
   ```
   Não diferencia "email não cadastrado" de "senha incorreta", e compara senha em texto puro.

4. Validação de sessão inexistente: o `App.js` não verifica AsyncStorage antes de definir a tela inicial (isso será feito pelo AGENT 01, mas a lógica de validação é sua).

### Objetivo

1. **Hash SHA-256 na senha** — usar `expo-crypto` (já incluso no Expo SDK 54, NÃO precisa instalar)
2. **Logout real** — criar fluxo de logout que limpa AsyncStorage e reseta a stack de navegação
3. **Validação de sessão** — ao iniciar, verificar se existe usuário salvo
4. **Mensagens de erro específicas** — email não encontrado vs senha incorreta
5. **Verificação de email duplicado** — no cadastro, garantir que o email não existe antes de criar

### Git Workflow

```bash
git checkout main
git pull origin main
git checkout -b feat/agent-02-auth

git add .
git commit -m "feat(auth): implementar hash SHA-256 na senha com expo-crypto"
# feat(auth): adicionar logout com reset de stack
# feat(auth): diferenciar mensagens de erro no login
# feat(cadastro): validar email duplicado antes de criar conta

git push origin feat/agent-02-auth
```

**Regras:**
- Mínimo 3 commits
- Nunca commitar direto na `main`
- Nunca fazer push forçado

### Arquivos a Modificar / Criar

#### NOVO: `services/auth.js`
Centralizar toda lógica de autenticação (hash, verificação, cadastro, logout):

```js
import * as Crypto from 'expo-crypto';
import { salvarUsuario, getUsuario, removerUsuario } from './storage';

/**
 * Gera hash SHA-256 de uma string.
 * expo-crypto já vem com Expo SDK 54 — não precisa instalar nada.
 */
export async function hashSenha(senha) {
  // Crypto.digestStringAsync retorna hex string
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    senha
  );
}

/**
 * Verifica se usuário existe e senha confere.
 * Retorna { sucesso, erro, usuario }
 */
export async function autenticar(email, senha) {
  const usuario = await getUsuario();

  if (!usuario) {
    return { sucesso: false, erro: 'email_nao_encontrado', usuario: null };
  }

  if (email.trim().toLowerCase() !== usuario.email.toLowerCase()) {
    return { sucesso: false, erro: 'email_nao_encontrado', usuario: null };
  }

  const hash = await hashSenha(senha);
  if (hash !== usuario.senhaHash) {
    return { sucesso: false, erro: 'senha_incorreta', usuario: null };
  }

  return { sucesso: true, erro: null, usuario };
}

/**
 * Cadastra novo usuário com senha hasheada.
 * Retorna { sucesso, erro }
 */
export async function cadastrar({ nome, email, senha, fotoUri }) {
  // Verificar email duplicado
  const existente = await getUsuario();
  if (existente && existente.email.toLowerCase() === email.trim().toLowerCase()) {
    return { sucesso: false, erro: 'email_duplicado' };
  }

  const senhaHash = await hashSenha(senha);
  const usuario = {
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    senhaHash,  // <-- hash, NÃO texto puro
    fotoUri: fotoUri || null,
    criadoEm: new Date().toISOString(),
  };

  await salvarUsuario(usuario);
  return { sucesso: true, erro: null, usuario };
}

/**
 * Logout: remove usuário do AsyncStorage.
 */
export async function logout() {
  await removerUsuario();
}
```

#### MODIFICAR: `screens/LoginScreen.js`

**Mensagens de erro específicas:**
```js
async function loginComSenha() {
  if (!usuario) {
    Alert.alert('Sem conta', 'Nenhuma conta encontrada. Crie uma primeiro.');
    return;
  }

  if (!email.trim() || !senha.trim()) {
    Alert.alert('Campos obrigatórios', 'Preencha e-mail e senha.');
    return;
  }

  const resultado = await autenticar(email, senha);

  if (!resultado.sucesso) {
    if (resultado.erro === 'email_nao_encontrado') {
      Alert.alert(
        'E-mail não encontrado',
        'Este e-mail não está cadastrado. Verifique ou crie uma conta.'
      );
    } else if (resultado.erro === 'senha_incorreta') {
      Alert.alert(
        'Senha incorreta',
        'A senha informada não confere. Tente novamente.'
      );
    }
    return;
  }

  login(resultado.usuario);
}
```

**Adicionar link "Esqueci a senha?":**
```jsx
<TouchableOpacity
  onPress={() => Alert.alert(
    'Recuperar senha',
    'Entre em contato pelo e-mail suporte@foome.app para redefinir sua senha.'
  )}
  style={{ alignSelf: 'flex-end', marginTop: 6, marginBottom: 4 }}
>
  <Text style={{ fontFamily: F.medium, fontSize: 12, color: C.ink3 }}>
    Esqueci a senha?
  </Text>
</TouchableOpacity>
```

**Nota sobre navegação:** A partir do AGENT 01, `LoginScreen` não usa mais `route.params`. A autenticação bem-sucedida chama `login(usuario)` do AppContext, que faz o RootNavigator trocar automaticamente para as telas autenticadas.

#### MODIFICAR: `screens/CadastroScreen.js`

**Validar email duplicado e usar hash:**
```js
async function finalizar() {
  if (!nome.trim() || !email.trim() || !senha.trim()) {
    Alert.alert('Atenção', 'Preencha todos os campos.');
    return;
  }
  if (!fotoUri) {
    Alert.alert('Foto obrigatória', 'Tire uma foto de perfil para continuar.');
    return;
  }
  if (senha.trim().length < 6) {
    Alert.alert('Senha curta', 'A senha deve ter no mínimo 6 caracteres.');
    return;
  }

  const resultado = await cadastrar({ nome, email, senha, fotoUri });

  if (!resultado.sucesso) {
    if (resultado.erro === 'email_duplicado') {
      Alert.alert(
        'E-mail já cadastrado',
        'Este e-mail já está em uso. Faça login ou use outro e-mail.'
      );
    }
    return;
  }

  Alert.alert(
    'Conta criada!',
    'Seu cadastro foi realizado com sucesso.',
    [{ text: 'Fazer login', onPress: () => navigation.navigate('Login') }]
  );
}
```

#### MODIFICAR: `components/PrimaryButton.js` (se necessário)
Verificar se o botão suporta estado `loading`. Se não, adicionar prop `loading`:
```js
export default function PrimaryButton({ label, onPress, color, disabled, loading, style, leftIcon }) {
  const bg = color ?? C.brand;
  return (
    <TouchableOpacity
      style={[s.btn, { backgroundColor: bg, shadowColor: bg }, (disabled || loading) && s.off, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
      ) : leftIcon ? (
        <View style={{ marginRight: 8 }}>{leftIcon}</View>
      ) : null}
      <Text style={s.txt}>{loading ? 'Aguarde...' : label}</Text>
    </TouchableOpacity>
  );
}
```

#### MODIFICAR: `App.js`
Garantir que a validação de sessão funcione (complementar ao que o AGENT 01 fizer):
- Se `AppContext` já verifica `getUsuario()` no mount, não precisa duplicar
- O importante é que, se existir usuário salvo, o app vá direto pra Home
- Se não existir, vá pro Login

#### MODIFICAR: `screens/PerfilScreen.js` (futuro — AGENT 13)
Deixar um ponto de extensão. O AGENT 13 vai criar a tela de perfil com botão de logout. Certifique-se de que `auth.logout()` esteja exportada e pronta para uso.

### Requisitos Técnicos

- **`expo-crypto`** — já incluso no Expo SDK 54. Usar `Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, texto)`. Não instalar nada.
- AsyncStorage para leitura/escrita (via `services/storage.js`)
- Compatível com o AppContext do AGENT 01

### Critérios de Entrega

- [ ] `services/auth.js` criado com `hashSenha()`, `autenticar()`, `cadastrar()`, `logout()`
- [ ] Senha NUNCA mais armazenada em texto puro — sempre `senhaHash`
- [ ] Login mostra "E-mail não encontrado" vs "Senha incorreta" em alerts separados
- [ ] Cadastro bloqueia email duplicado com mensagem clara
- [ ] Senha com menos de 6 caracteres rejeitada no cadastro
- [ ] Link "Esqueci a senha?" funcional (Alert informativo, não precisa implementar recuperação real)
- [ ] Função `logout()` exportada e funcional
- [ ] Usuário existente com senha antiga (texto puro) — tratar migração: se `usuario.senhaHash` não existe mas `usuario.senha` existe, fazer hash da senha existente e salvar (migração automática)

**Migração automática (IMPORTANTE):**
```js
// Em autenticar(), antes de comparar hash:
if (!usuario.senhaHash && usuario.senha) {
  // Migrar de texto puro para hash
  usuario.senhaHash = await hashSenha(usuario.senha);
  delete usuario.senha;
  await salvarUsuario(usuario);
}
```

### Exemplos e Referências

Uso do `expo-crypto`:
```js
import * as Crypto from 'expo-crypto';

const hash = await Crypto.digestStringAsync(
  Crypto.CryptoDigestAlgorithm.SHA256,
  'minha-senha-123'
);
// hash = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
```

### Não Faça

- **Não instale bcrypt, bcryptjs, crypto-js, ou qualquer lib de hash externa** — `expo-crypto` já está disponível
- **Não use Math.random() ou algorítmo próprio de hash** — somente SHA-256 via expo-crypto
- **Não altere a estrutura do objeto usuário em `storage.js`** além de trocar `senha` por `senhaHash`
- **Não implemente JWT, OAuth, ou autenticação com servidor externo** — o app é local/single-user
- **Não crie tela de "Esqueci a senha" completa** — só um Alert informativo
- **Não mexa no fluxo de biometria** — `services/biometria.js` continua igual
