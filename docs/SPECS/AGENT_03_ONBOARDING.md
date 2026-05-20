# AGENT 03 — Splash Screen, Onboarding e Assets
## Foome — Spec de Desenvolvimento

### Contexto

O app atualmente:
- Usa `expo-splash-screen` (`~31.0.13`, já instalado) apenas para esperar as fontes carregarem
- Splash screen configurada com fundo branco, sem logo customizada (`app.json` linha 9-11)
- Não tem fluxo de onboarding para primeiro acesso
- Não tem ícone ou logo próprio — usa placeholder de restaurante
- `adaptiveIcon` do Android configurado com cor `#FF4757` (errada, deveria ser brand `#E8452C`)

### Objetivo

1. **Splash screen animada** — logo Foome com fade-in + scale usando Reanimated
2. **Fluxo de onboarding de 3 slides** — só no primeiro acesso (flag `@foome_onboarding_done` no AsyncStorage)
3. **Criar assets visuais** — `assets/logo.svg` e placeholder de `assets/icon.png`
4. **Configurar `app.json`** corretamente com splash, icon e adaptive-icon
5. **Criar tela `OnboardingScreen.js`** com animações e navegação

### Git Workflow

```bash
git checkout main
git pull origin main
git checkout -b feat/agent-03-onboarding

git add .
git commit -m "feat(onboarding): criar tela de onboarding com 3 slides animados"
# feat(assets): criar logo e assets do app
# feat(splash): implementar splash screen animada com Reanimated
# chore(config): configurar app.json com novos assets

git push origin feat/agent-03-onboarding
```

**Regras:**
- Mínimo 3 commits
- Nunca commitar direto na `main`
- Nunca fazer push forçado

### Arquivos a Modificar / Criar

#### NOVO: `screens/OnboardingScreen.js`

3 slides com animações. Estrutura:

```jsx
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Platform, FlatList, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, F, SHADOW } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    emoji: '🍔',
    titulo: 'Descubra restaurantes\nperto de você',
    subtitulo: 'Explore os melhores estabelecimentos da sua região com apenas alguns toques.',
    cor: C.brand,
  },
  {
    id: '2',
    emoji: '⚡',
    titulo: 'Peça com\num toque',
    subtitulo: 'Do cardápio ao pedido confirmado em segundos. Simples e rápido.',
    cor: C.amber,
  },
  {
    id: '3',
    emoji: '🛵',
    titulo: 'Acompanhe\nseu pedido',
    subtitulo: 'Acompanhe o status em tempo real e receba notificações a cada etapa.',
    cor: C.teal,
  },
];

export default function OnboardingScreen({ onFinish }) {
  const [slideAtivo, setSlideAtivo] = useState(0);
  const flatRef = useRef(null);

  async function finalizar() {
    await AsyncStorage.setItem('@foome_onboarding_done', 'true');
    onFinish();
  }

  function next() {
    if (slideAtivo < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: slideAtivo + 1 });
    } else {
      finalizar();
    }
  }

  // ... renderizar FlatList horizontal com snap, dots indicadores,
  //     botão "Próximo" / "Começar", link "Pular" no canto superior
}
```

**Especificações de UI:**
- FlatList horizontal com `pagingEnabled` e `snapToInterval={width}`
- Cada slide: emoji grande (80px), título em Poppins Bold 28px, subtítulo em Inter Regular 15px, cor do texto ink/ink2
- Indicador de dots: 3 círculos, o ativo com a cor do slide, inativos em `C.ink4`
- Botão "Próximo" → "Começar" no último slide, com a cor do slide atual
- Link "Pular" no topo direito, texto ink3, só nos slides 1 e 2
- Animações simples com `Animated` (React Native core, não precisa Reanimated):
  - Emoji com scale-in + fade-in
  - Título com translateY subindo
  - Botão com fade-in com delay

#### NOVO: `assets/logo.svg`

Criar um SVG simples com o nome "Foome" usando as cores do tema:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#E8452C"/>
      <stop offset="100%" style="stop-color:#FF6B3D"/>
    </linearGradient>
  </defs>
  <!-- Ícone: garfo e faca simplificados -->
  <circle cx="30" cy="30" r="18" fill="url(#g)" opacity="0.15"/>
  <text x="30" y="36" text-anchor="middle" font-size="24">🍔</text>
  <!-- Nome -->
  <text x="58" y="36" font-family="'Poppins', sans-serif" font-weight="800" font-size="28" fill="#17172B" letter-spacing="-1">
    Foome
  </text>
</svg>
```

Salvar como `assets/logo.svg`.

#### NOVO: `assets/icon.png`

Como não podemos gerar uma imagem real, criar um script que gera um placeholder. Ou melhor: usar um ícone existente do `@expo/vector-icons` como inspiração e criar um PNG simples.

**Alternativa prática:** Criar um arquivo `assets/generate_icon.html` que, quando aberto no navegador, renderiza um ícone 1024x1024 com as cores Foome. O usuário tira screenshot e salva como `icon.png`.

Ou, mais simples: usar o emoji 🍔 em canvas 1024x1024 com fundo brand.

```html
<!-- assets/generate_icon.html -->
<!DOCTYPE html>
<html><body style="margin:0;display:flex;align-items:center;justify-content:center;width:1024px;height:1024px;background:#E8452C;border-radius:224px;">
  <span style="font-size:500px;">🍔</span>
</body></html>
```

**IMPORTANTE:** Na spec, instrua a criar também:
- `assets/icon.png` — 1024x1024 (usar o HTML acima ou criar com qualquer ferramenta)
- `assets/adaptive-icon.png` — 1024x1024 com fundo brand `#E8452C`
- `assets/favicon.png` — 48x48
- `assets/splash-icon.png` — 128x128, fundo branco com logo centralizado

#### MODIFICAR: `app.json`

```json
{
  "expo": {
    "name": "Foome",
    "slug": "foome",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#FFFFFF"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.foome.app",
      "infoPlist": {
        "NSCameraUsageDescription": "Foome usa a câmera para sua foto de perfil.",
        "NSFaceIDUsageDescription": "Foome usa biometria para confirmar suas compras."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#E8452C"
      },
      "package": "com.foome.app",
      "permissions": ["CAMERA", "USE_BIOMETRIC", "USE_FINGERPRINT"]
    },
    "plugins": [
      ["expo-camera", { "cameraPermission": "Foome precisa da câmera para sua foto de perfil." }],
      "expo-splash-screen"
    ]
  }
}
```

Mudanças principais:
- `icon` apontando para `./assets/icon.png`
- `splash.image` apontando para `./assets/splash-icon.png`
- `android.adaptiveIcon.foregroundImage` e `backgroundColor` corrigido para `#E8452C`
- `ios.bundleIdentifier` e `android.package` adicionados
- plugin `expo-splash-screen` adicionado

#### MODIFICAR: `App.js`

Adicionar lógica de onboarding e splash screen melhorada:

```jsx
import React, { useCallback, useState, useEffect } from 'react';
import { View, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// ... outros imports

const Stack = createStackNavigator();

function SplashAnimada({ onFinish }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={{ opacity, transform: [{ scale }], alignItems: 'center' }}>
        <View style={{
          width: 90, height: 90,
          borderRadius: 28,
          backgroundColor: C.brandLight,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
          borderWidth: 2,
          borderColor: C.brandBorder,
        }}>
          <Text style={{ fontSize: 44 }}>🍔</Text>
        </View>
        <Text style={{ fontFamily: F.headingLg, fontSize: 40, color: C.brand, letterSpacing: -1.5 }}>
          Foome
        </Text>
        <Text style={{ fontFamily: F.regular, fontSize: 14, color: C.ink3, marginTop: 6 }}>
          Comida boa, na hora certa.
        </Text>
      </Animated.View>
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ /* ... mesmas fontes ... */ });
  const [mostrarSplash, setMostrarSplash] = useState(true);
  const [onboardingFeito, setOnboardingFeito] = useState(null); // null = carregando

  // Verificar se onboarding já foi visto
  useEffect(() => {
    AsyncStorage.getItem('@foome_onboarding_done').then(v => setOnboardingFeito(v === 'true'));
  }, []);

  const onReady = useCallback(async () => {
    if (fontsLoaded || fontError) await SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;
  if (mostrarSplash) return <SplashAnimada onFinish={() => setMostrarSplash(false)} />;
  if (onboardingFeito === null) return null; // aguardando leitura do AsyncStorage

  return (
    <AppProvider>
      <CarrinhoProvider>
        <View style={{ flex: 1 }} onLayout={onReady}>
          {!onboardingFeito ? (
            <OnboardingScreen onFinish={() => setOnboardingFeito(true)} />
          ) : (
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          )}
        </View>
      </CarrinhoProvider>
    </AppProvider>
  );
}
```

### Requisitos Técnicos

- **Reanimated 4.1.1** — já instalado, mas SplashAnimada usa `Animated` do RN core para simplicidade
- **AsyncStorage** — já instalado
- **expo-splash-screen** — já instalado
- Nenhuma dependência nova necessária

### Critérios de Entrega

- [ ] `assets/logo.svg` criado com design Foome
- [ ] `assets/icon.png`, `assets/adaptive-icon.png`, `assets/favicon.png`, `assets/splash-icon.png` criados
- [ ] `app.json` atualizado com paths corretos e cores corrigidas
- [ ] `screens/OnboardingScreen.js` funcional com 3 slides
- [ ] Flag `@foome_onboarding_done` salva no AsyncStorage após onboarding
- [ ] Splash animada com fade-in + scale no logo
- [ ] Onboarding só aparece no primeiro acesso
- [ ] Link "Pular" funcional nos slides 1 e 2
- [ ] Botão "Começar" no slide 3 leva ao app
- [ ] Navegação flui: Splash → Onboarding (se primeiro acesso) → App (Login ou Home)

### Exemplos e Referências

Tema atual (use estas cores):
- Brand: `#E8452C`
- Ink: `#17172B`
- Ink2: `#4A4A6A`
- Ink3: `#9494B2`
- BG: `#F5F5FA`
- Surface: `#FFFFFF`

### Não Faça

- **Não implemente login social nem tela de boas-vindas adicional** — o fluxo é: Splash → Onboarding → Login/Home
- **Não use bibliotecas de terceiros para onboarding** — FlatList + Animated nativos bastam
- **Não crie splash screen de vídeo** — apenas animação simples
- **Não modifique telas existentes** — seu foco é splash, onboarding e assets
