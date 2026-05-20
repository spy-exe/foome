# AGENT 16 — Testes Automatizados
## Foome — Spec de Desenvolvimento

### Contexto

O projeto **não tem nenhum teste**. Zero. Não há Jest configurado, não há `__tests__/`, não há scripts de teste no `package.json`.

Isso é um risco para um app que será avaliado — testes garantem que alterações futuras não quebrem funcionalidades existentes e demonstram qualidade de engenharia.

### Objetivo

1. Configurar Jest + React Native Testing Library
2. Criar testes unitários para services (`storage.js`, `biometria.js`, `auth.js`)
3. Criar testes de componente (`Stepper`, `PrimaryButton`, `Toast`)
4. Criar teste de integração do fluxo de login
5. Configurar coverage mínimo de 60% nos services e components

### Git Workflow

```bash
git checkout main
git pull origin main
git checkout -b feat/agent-16-tests

git add .
git commit -m "chore(test): configurar Jest e React Native Testing Library"
# test(services): adicionar testes para storage, biometria e auth
# test(components): adicionar testes para Stepper, PrimaryButton e Toast
# test(integration): adicionar teste de fluxo de login

git push origin feat/agent-16-tests
```

**Regras:**
- Mínimo 3 commits
- Nunca commitar direto na `main`
- Nunca fazer push forçado

### Arquivos a Modificar / Criar

#### Step 1: Instalar dependências

```bash
npx expo install jest-expo jest @testing-library/react-native @testing-library/jest-native
```

#### NOVO: `jest.config.js`

```js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],
  setupFilesAfterSetup: ['./jest-setup.js'],
  collectCoverageFrom: [
    'services/**/*.js',
    'components/**/*.js',
    '!components/RestauranteCard.js', // excluído por depender de navegação
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};
```

#### NOVO: `jest-setup.js`

```js
import '@testing-library/jest-native/extend-expect';

// Mock para AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock para expo-local-authentication
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true, error: null })),
}));

// Mock para expo-crypto
jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA256' },
  digestStringAsync: jest.fn((algorithm, text) =>
    Promise.resolve(`hash-${text}`)
  ),
}));

// Mock para expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// Mock para expo-font
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));

// Mock para react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock para react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    GestureHandlerRootView: View,
    // ...outros mocks conforme necessário
  };
});
```

#### MODIFICAR: `package.json`

Adicionar script de teste:

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

#### NOVO: `__tests__/services/storage.test.js`

```js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { salvarUsuario, getUsuario, removerUsuario, salvarPedidos, getPedidos } from '../../services/storage';

beforeEach(() => {
  AsyncStorage.setItem.mockClear();
  AsyncStorage.getItem.mockClear();
  AsyncStorage.removeItem.mockClear();
});

describe('storage', () => {
  describe('salvarUsuario', () => {
    it('deve salvar usuário no AsyncStorage como JSON', async () => {
      const usuario = { nome: 'João', email: 'joao@teste.com' };
      await salvarUsuario(usuario);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@foome_usuario',
        JSON.stringify(usuario)
      );
    });
  });

  describe('getUsuario', () => {
    it('deve retornar usuário parseado quando existe', async () => {
      const usuario = { nome: 'João', email: 'joao@teste.com' };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(usuario));

      const result = await getUsuario();
      expect(result).toEqual(usuario);
    });

    it('deve retornar null quando não existe usuário', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await getUsuario();
      expect(result).toBeNull();
    });
  });

  describe('removerUsuario', () => {
    it('deve remover a chave do AsyncStorage', async () => {
      await removerUsuario();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@foome_usuario');
    });
  });

  describe('salvarPedidos', () => {
    it('deve salvar array de pedidos como JSON', async () => {
      const pedidos = [{ id: '1', total: 50 }];
      await salvarPedidos(pedidos);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@foome_pedidos',
        JSON.stringify(pedidos)
      );
    });
  });

  describe('getPedidos', () => {
    it('deve retornar array vazio quando não há pedidos', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      const result = await getPedidos();
      expect(result).toEqual([]);
    });

    it('deve retornar pedidos parseados', async () => {
      const pedidos = [{ id: '1', total: 50 }];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(pedidos));
      const result = await getPedidos();
      expect(result).toEqual(pedidos);
    });
  });
});
```

#### NOVO: `__tests__/services/biometria.test.js`

```js
import * as LocalAuthentication from 'expo-local-authentication';
import { verificarBiometria } from '../../services/biometria';

describe('biometria', () => {
  beforeEach(() => {
    LocalAuthentication.hasHardwareAsync.mockClear();
    LocalAuthentication.isEnrolledAsync.mockClear();
    LocalAuthentication.authenticateAsync.mockClear();
  });

  it('deve retornar sucesso true quando biometria ok', async () => {
    LocalAuthentication.hasHardwareAsync.mockResolvedValue(true);
    LocalAuthentication.isEnrolledAsync.mockResolvedValue(true);
    LocalAuthentication.authenticateAsync.mockResolvedValue({ success: true, error: null });

    const result = await verificarBiometria();
    expect(result.sucesso).toBe(true);
    expect(result.erro).toBeNull();
  });

  it('deve retornar erro quando hardware não suporta', async () => {
    LocalAuthentication.hasHardwareAsync.mockResolvedValue(false);

    const result = await verificarBiometria();
    expect(result.sucesso).toBe(false);
    expect(result.erro).toContain('não suporta');
  });

  it('deve retornar erro quando nenhuma biometria cadastrada', async () => {
    LocalAuthentication.hasHardwareAsync.mockResolvedValue(true);
    LocalAuthentication.isEnrolledAsync.mockResolvedValue(false);

    const result = await verificarBiometria();
    expect(result.sucesso).toBe(false);
    expect(result.erro).toContain('Nenhuma biometria');
  });

  it('deve retornar erro quando autenticação falha', async () => {
    LocalAuthentication.hasHardwareAsync.mockResolvedValue(true);
    LocalAuthentication.isEnrolledAsync.mockResolvedValue(true);
    LocalAuthentication.authenticateAsync.mockResolvedValue({
      success: false,
      error: 'user_cancel',
    });

    const result = await verificarBiometria();
    expect(result.sucesso).toBe(false);
    expect(result.erro).toBe('user_cancel');
  });
});
```

#### NOVO: `__tests__/services/auth.test.js`

```js
import * as Crypto from 'expo-crypto';
import { salvarUsuario, getUsuario } from '../../services/storage';
import { hashSenha, autenticar, cadastrar, logout } from '../../services/auth';

// Mock do AsyncStorage para simular usuário salvo
import AsyncStorage from '@react-native-async-storage/async-storage';

beforeEach(() => {
  jest.clearAllMocks();
  AsyncStorage.getItem.mockReset();
  AsyncStorage.setItem.mockReset();
});

describe('auth', () => {
  describe('hashSenha', () => {
    it('deve gerar hash SHA-256 da senha', async () => {
      const hash = await hashSenha('minha-senha');
      expect(hash).toBe('hash-minha-senha'); // mock retorna "hash-{input}"
      expect(Crypto.digestStringAsync).toHaveBeenCalled();
    });
  });

  describe('cadastrar', () => {
    it('deve cadastrar novo usuário com senha hasheada', async () => {
      AsyncStorage.getItem.mockResolvedValue(null); // sem usuário existente

      const result = await cadastrar({
        nome: 'João',
        email: 'joao@teste.com',
        senha: '123456',
        fotoUri: null,
      });

      expect(result.sucesso).toBe(true);
      expect(result.usuario.senhaHash).toBeDefined();
      expect(result.usuario.senhaHash).not.toBe('123456');
    });

    it('deve rejeitar email duplicado', async () => {
      const existente = { nome: 'João', email: 'joao@teste.com', senhaHash: 'abc' };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existente));

      const result = await cadastrar({
        nome: 'João 2',
        email: 'joao@teste.com',
        senha: '654321',
        fotoUri: null,
      });

      expect(result.sucesso).toBe(false);
      expect(result.erro).toBe('email_duplicado');
    });
  });

  describe('autenticar', () => {
    it('deve autenticar com credenciais corretas', async () => {
      const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, '123456');
      const usuario = { nome: 'João', email: 'joao@teste.com', senhaHash: hash };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(usuario));

      const result = await autenticar('joao@teste.com', '123456');

      expect(result.sucesso).toBe(true);
      expect(result.erro).toBeNull();
    });

    it('deve retornar erro para email não cadastrado', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await autenticar('inexistente@teste.com', '123456');

      expect(result.sucesso).toBe(false);
      expect(result.erro).toBe('email_nao_encontrado');
    });

    it('deve retornar erro para senha incorreta', async () => {
      const usuario = {
        nome: 'João',
        email: 'joao@teste.com',
        senhaHash: 'hash-123456',
      };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(usuario));

      const result = await autenticar('joao@teste.com', 'wrong');

      expect(result.sucesso).toBe(false);
      expect(result.erro).toBe('senha_incorreta');
    });
  });

  describe('logout', () => {
    it('deve remover usuário do AsyncStorage', async () => {
      await logout();
      // logout chama removerUsuario internamente
      // Verificar que removeItem foi chamado (feito pelo mock de storage)
      // Nota: depende da implementação de logout em auth.js
    });
  });
});
```

#### NOVO: `__tests__/components/Stepper.test.js`

```js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Stepper from '../../components/Stepper';

describe('Stepper', () => {
  it('deve renderizar botão de adicionar quando quantidade é 0', () => {
    const onAdd = jest.fn();
    const { getByText } = render(
      <Stepper quantidade={0} cor="#E8452C" onAdicionar={onAdd} onRemover={jest.fn()} />
    );

    // Deve mostrar botão "+" (Feather icon plus)
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('deve mostrar controles +/- quando quantidade > 0', () => {
    const { getByText } = render(
      <Stepper quantidade={3} cor="#E8452C" onAdicionar={jest.fn()} onRemover={jest.fn()} />
    );

    expect(getByText('3')).toBeTruthy();
  });

  it('deve disparar onAdicionar ao tocar no + (estado zero)', () => {
    const onAdd = jest.fn();
    const { getByTestId, UNSAFE_getByType } = render(
      <Stepper quantidade={0} cor="#E8452C" onAdicionar={onAdd} onRemover={jest.fn()} />
    );

    // Encontrar o TouchableOpacity e clicar
    const touchable = UNSAFE_getByType(require('react-native').TouchableOpacity);
    fireEvent.press(touchable);

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('deve disparar onAdicionar ao tocar no + (qtd > 0)', () => {
    const onAdd = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <Stepper quantidade={2} cor="#E8452C" onAdicionar={onAdd} onRemover={jest.fn()} />
    );

    const touchables = UNSAFE_getAllByType(require('react-native').TouchableOpacity);
    // touchables[0] = "-", touchables[1] = "+"
    fireEvent.press(touchables[1]);
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('deve disparar onRemover ao tocar no -', () => {
    const onRemove = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <Stepper quantidade={2} cor="#E8452C" onAdicionar={jest.fn()} onRemover={onRemove} />
    );

    const touchables = UNSAFE_getAllByType(require('react-native').TouchableOpacity);
    fireEvent.press(touchables[0]);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
```

#### NOVO: `__tests__/components/PrimaryButton.test.js`

```js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PrimaryButton from '../../components/PrimaryButton';

describe('PrimaryButton', () => {
  it('deve renderizar label corretamente', () => {
    const { getByText } = render(
      <PrimaryButton label="Entrar" onPress={jest.fn()} />
    );
    expect(getByText('Entrar')).toBeTruthy();
  });

  it('deve disparar onPress ao tocar', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PrimaryButton label="Entrar" onPress={onPress} />
    );

    fireEvent.press(getByText('Entrar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('não deve disparar onPress quando disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PrimaryButton label="Entrar" onPress={onPress} disabled />
    );

    fireEvent.press(getByText('Entrar'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('deve usar cor customizada quando fornecida', () => {
    const { UNSAFE_getByType } = render(
      <PrimaryButton label="Teste" onPress={jest.fn()} color="#00BE99" />
    );

    const touchable = UNSAFE_getByType(require('react-native').TouchableOpacity);
    expect(touchable.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: '#00BE99' }),
      ])
    );
  });
});
```

#### NOVO: `__tests__/components/Toast.test.js`

```js
import React from 'react';
import { render } from '@testing-library/react-native';
import Toast from '../../components/Toast';

// Nota: Toast usa Reanimated (Animated.View), que está mockado.
// Testes verificam renderização condicional e tipos.

describe('Toast', () => {
  it('não deve renderizar quando visivel=false', () => {
    const { toJSON } = render(
      <Toast visivel={false} mensagem="Teste" tipo="info" onClose={jest.fn()} />
    );
    expect(toJSON()).toBeNull();
  });

  it('deve renderizar mensagem de sucesso', () => {
    const { getByText } = render(
      <Toast visivel={true} mensagem="Deu certo!" tipo="sucesso" onClose={jest.fn()} />
    );
    expect(getByText('Deu certo!')).toBeTruthy();
  });

  it('deve renderizar mensagem de erro', () => {
    const { getByText } = render(
      <Toast visivel={true} mensagem="Algo deu errado" tipo="erro" onClose={jest.fn()} />
    );
    expect(getByText('Algo deu errado')).toBeTruthy();
  });

  it('deve renderizar mensagem de info', () => {
    const { getByText } = render(
      <Toast visivel={true} mensagem="Informação" tipo="info" onClose={jest.fn()} />
    );
    expect(getByText('Informação')).toBeTruthy();
  });
});
```

#### NOVO: `__tests__/integration/login.test.js`

Teste de integração simulando o fluxo completo de login:

```js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { hashSenha, autenticar, cadastrar } from '../../services/auth';

describe('Fluxo de Login (Integração)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockReset();
    AsyncStorage.setItem.mockReset();
  });

  it('fluxo completo: cadastrar → autenticar com sucesso', async () => {
    // 1. Cadastrar novo usuário
    AsyncStorage.getItem.mockResolvedValue(null);
    const cadastro = await cadastrar({
      nome: 'Maria',
      email: 'maria@teste.com',
      senha: 'senha123',
      fotoUri: null,
    });

    expect(cadastro.sucesso).toBe(true);
    expect(cadastro.usuario.senhaHash).toBeDefined();

    // 2. Simular usuário salvo no AsyncStorage (mock retorna o que foi salvo)
    const usuarioSalvo = cadastro.usuario;
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(usuarioSalvo));

    // 3. Tentar autenticar com senha correta
    const authCorreto = await autenticar('maria@teste.com', 'senha123');
    expect(authCorreto.sucesso).toBe(true);

    // 4. Tentar autenticar com senha errada
    const authErrado = await autenticar('maria@teste.com', 'errada');
    expect(authErrado.sucesso).toBe(false);
    expect(authErrado.erro).toBe('senha_incorreta');
  });

  it('fluxo: tentar cadastrar email que já existe', async () => {
    const existente = {
      nome: 'João',
      email: 'joao@teste.com',
      senhaHash: 'hash-senha123',
    };
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existente));

    const result = await cadastrar({
      nome: 'João Clone',
      email: 'joao@teste.com',
      senha: 'outrasenha',
      fotoUri: null,
    });

    expect(result.sucesso).toBe(false);
    expect(result.erro).toBe('email_duplicado');
  });
});
```

### Requisitos Técnicos

- `jest-expo` — preset de Jest para Expo SDK 54
- `@testing-library/react-native` — para testes de componente
- `@testing-library/jest-native` — para matchers como `toBeVisible()`, `toHaveTextContent()`
- `react-native-reanimated/mock` — mock oficial do Reanimated

### Estrutura Final de Diretórios

```
Foome-Final/
├── __tests__/
│   ├── services/
│   │   ├── storage.test.js
│   │   ├── biometria.test.js
│   │   └── auth.test.js
│   ├── components/
│   │   ├── Stepper.test.js
│   │   ├── PrimaryButton.test.js
│   │   └── Toast.test.js
│   └── integration/
│       └── login.test.js
├── jest.config.js
├── jest-setup.js
└── package.json (modificado com script "test")
```

### Critérios de Entrega

- [ ] `npm test` executa sem erros de configuração
- [ ] Todos os testes de `services/storage.test.js` passam (6+ testes)
- [ ] Todos os testes de `services/biometria.test.js` passam (4+ testes)
- [ ] Todos os testes de `services/auth.test.js` passam (6+ testes)
- [ ] Todos os testes de `components/Stepper.test.js` passam (4+ testes)
- [ ] Todos os testes de `components/PrimaryButton.test.js` passam (4+ testes)
- [ ] Todos os testes de `components/Toast.test.js` passam (3+ testes)
- [ ] Teste de integração de login passa
- [ ] Coverage report gerado com `jest --coverage`
- [ ] `jest-setup.js` com todos os mocks necessários
- [ ] `jest.config.js` com preset e transformIgnorePatterns corretos

### Não Faça

- **Não teste telas completas (screens/)** — apenas services, components e integração de auth
- **Não teste RestauranteCard** — depende de navegação, muito complexo para mock
- **Não use Enzyme** — use React Native Testing Library
- **Não crie testes E2E** — apenas testes unitários e de integração leve
- **Não modifique código de produção para "facilitar testes"** — se um componente não for testável como está, documente no relatório
