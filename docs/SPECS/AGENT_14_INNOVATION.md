# AGENT 14 — Features Inovadoras
## Foome — Spec de Desenvolvimento

### Contexto

O app tem o básico de delivery, mas faltam features que surpreendam. Este agente implementa 3 features diferenciadas que agregam valor real à experiência:

1. **"Favoritos seus 🔥"** — recomendação baseada no histórico de pedidos
2. **"Repetir último pedido"** — FAB flutuante para pedido rápido
3. **"Avaliação pós-entrega"** — modal de 5 estrelas quando pedido é concluído

### Objetivo

1. **Recomendação inteligente** — calcular top 3 itens mais pedidos e exibir na HomeScreen
2. **FAB "Repetir último pedido"** — buscar último pedido, popular carrinho, navegar direto
3. **Avaliação pós-entrega** — modal com estrelas interativas + comentário

### Git Workflow

```bash
git checkout main
git pull origin main
git checkout -b feat/agent-14-innovation

git add .
git commit -m "feat(recomendacao): implementar seção 'Favoritos seus' na HomeScreen"
# feat(pedidos): criar FAB 'Repetir último pedido' na HomeScreen
# feat(avaliacao): implementar modal de avaliação pós-entrega
# feat(avaliacao): calcular média do restaurante com avaliações salvas

git push origin feat/agent-14-innovation
```

**Regras:**
- Mínimo 3 commits
- Nunca commitar direto na `main`
- Nunca fazer push forçado

### Arquivos a Modificar / Criar

#### NOVO: `services/recomendacao.js`

```js
import { getPedidos } from './storage';

/**
 * Retorna os 3 itens mais pedidos pelo usuário,
 * ordenados por frequência (quantidade total pedida).
 */
export async function getItensFavoritos() {
  const pedidos = await getPedidos();
  if (!pedidos.length) return [];

  // Contar frequência de cada item
  const contagem = {};
  for (const pedido of pedidos) {
    for (const item of pedido.itens) {
      const chave = item.id;
      if (!contagem[chave]) {
        contagem[chave] = { ...item, qtdTotal: 0, vezesPedido: 0 };
      }
      contagem[chave].qtdTotal += item.qtd;
      contagem[chave].vezesPedido += 1;
    }
  }

  // Ordenar por quantidade total (decrescente)
  const favoritos = Object.values(contagem)
    .sort((a, b) => b.qtdTotal - a.qtdTotal)
    .slice(0, 3);

  return favoritos;
}

/**
 * Retorna o último pedido feito pelo usuário.
 */
export async function getUltimoPedido() {
  const pedidos = await getPedidos();
  if (!pedidos.length) return null;
  return pedidos[0]; // já ordenado por timestamp (mais recente primeiro)
}
```

#### NOVO: `services/avaliacao.js`

```js
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@foome_avaliacoes';

/**
 * Salva uma avaliação associada ao pedido.
 * @param {string} pedidoId
 * @param {{ nota: number, comentario: string, restauranteNome: string }} avaliacao
 */
export async function salvarAvaliacao(pedidoId, avaliacao) {
  const json = await AsyncStorage.getItem(KEY);
  const avaliacoes = json ? JSON.parse(json) : [];
  avaliacoes.push({
    pedidoId,
    ...avaliacao,
    timestamp: new Date().toISOString(),
  });
  await AsyncStorage.setItem(KEY, JSON.stringify(avaliacoes));
}

/**
 * Retorna todas as avaliações.
 */
export async function getAvaliacoes() {
  const json = await AsyncStorage.getItem(KEY);
  return json ? JSON.parse(json) : [];
}

/**
 * Calcula a nota média de um restaurante baseado nas avaliações.
 * @param {string} restauranteNome
 */
export async function getNotaMediaRestaurante(restauranteNome) {
  const avaliacoes = await getAvaliacoes();
  const doRestaurante = avaliacoes.filter(a => a.restauranteNome === restauranteNome);
  if (!doRestaurante.length) return null;
  const media = doRestaurante.reduce((s, a) => s + a.nota, 0) / doRestaurante.length;
  return Math.round(media * 10) / 10; // 1 casa decimal
}
```

#### MODIFICAR: `screens/HomeScreen.js`

**1. Seção "Favoritos seus 🔥"**

Adicionar após a seção de categorias e antes de "Perto de você":

```jsx
const [favoritos, setFavoritos] = useState([]);

useEffect(() => {
  getItensFavoritos().then(setFavoritos);
}, []);

// No render, após os chips de categoria:
{!busca && !catAtiva && favoritos.length > 0 && (
  <>
    <Text style={s.sectionLabel}>Favoritos seus 🔥</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.favRow}>
      {favoritos.map(item => {
        // Encontrar restaurante dono do item
        const rest = RESTAURANTES.find(r => r.produtos.some(p => p.id === item.id));
        if (!rest) return null;
        return (
          <TouchableOpacity
            key={item.id}
            style={[s.favCard, { backgroundColor: C.surface }]}
            onPress={() => {
              navigation.navigate('HomeTab', {
                screen: 'Restaurante',
                params: { restaurante: rest },
              });
            }}
            activeOpacity={0.85}
          >
            <View style={[s.favEmoji, { backgroundColor: rest.cor + '18' }]}>
              <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
            </View>
            <Text style={s.favNome} numberOfLines={1}>{item.nome}</Text>
            <Text style={[s.favPreco, { color: rest.cor }]}>{formatarPreco(item.preco)}</Text>
            <View style={s.favVezes}>
              <Feather name="repeat" size={10} color={C.ink3} />
              <Text style={s.favVezesTxt}>{item.vezesPedido}x</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </>
)}
```

Estilos novos:
```js
favRow: { paddingHorizontal: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl },
favCard: {
  width: 140,
  borderRadius: RADIUS.lg,
  padding: SPACING.md,
  borderWidth: 1,
  borderColor: C.border,
  ...SHADOW.card,
},
favEmoji: {
  width: 56, height: 56,
  borderRadius: RADIUS.md,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: SPACING.sm,
},
favNome: { fontFamily: F.semibold, fontSize: 13, color: C.ink, marginBottom: 2 },
favPreco: { fontFamily: F.bold, fontSize: 15 },
favVezes: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
favVezesTxt: { fontFamily: F.medium, fontSize: 10, color: C.ink3 },
```

**2. FAB "Repetir último pedido"**

```jsx
const [ultimoPedido, setUltimoPedido] = useState(null);
const fabScale = useSharedValue(1);

useEffect(() => {
  getUltimoPedido().then(p => setUltimoPedido(p));
}, []);

function repetirUltimoPedido() {
  if (!ultimoPedido) {
    Alert.alert('Sem pedidos', 'Faça seu primeiro pedido primeiro!');
    return;
  }

  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

  // Encontrar restaurante do último pedido
  const rest = RESTAURANTES.find(r => r.nome === ultimoPedido.restaurante);
  if (!rest) return;

  // Popular carrinho
  setRestaurante(rest);
  for (const item of ultimoPedido.itens) {
    for (let i = 0; i < item.qtd; i++) {
      adicionar(item); // isso adiciona 1 por vez
    }
  }

  // Navegar para Carrinho
  navigation.navigate('HomeTab', {
    screen: 'Carrinho',
  });
}

// No render, posicionado absolute:
{ultimoPedido && !busca && (
  <Animated.View style={[s.fab, fabAnimatedStyle]}>
    <TouchableOpacity
      style={[s.fabBtn, { backgroundColor: C.brand }]}
      onPress={repetirUltimoPedido}
      activeOpacity={0.85}
      onPressIn={() => fabScale.value = withSpring(0.9)}
      onPressOut={() => fabScale.value = withSpring(1)}
    >
      <Feather name="repeat" size={20} color="#fff" />
    </TouchableOpacity>
  </Animated.View>
)}
```

Estilos do FAB:
```js
fab: {
  position: 'absolute',
  bottom: 24,
  right: 16,
  zIndex: 100,
  ...SHADOW.float,
},
fabBtn: {
  width: 56, height: 56,
  borderRadius: 28,
  justifyContent: 'center',
  alignItems: 'center',
},
```

O FAB deve ter animação de pulso (similar ao badge) para chamar atenção.

#### MODIFICAR: `screens/DetalhePedidoScreen.js` (ou criar no AGENT 09)

**3. Modal de avaliação pós-entrega**

Quando o pedido atinge status "entregue", disparar o modal de avaliação:

```jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { salvarAvaliacao } from '../services/avaliacao';
import { C, F } from '../constants/theme';
import PrimaryButton from '../components/PrimaryButton';

function ModalAvaliacao({ visivel, pedido, onClose }) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');

  async function enviar() {
    if (nota === 0) {
      Alert.alert('Atenção', 'Selecione uma nota de 1 a 5 estrelas.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await salvarAvaliacao(pedido.id, {
      nota,
      comentario,
      restauranteNome: pedido.restaurante,
    });
    onClose();
    Alert.alert('Obrigado!', 'Sua avaliação ajuda a melhorar o Foome.');
  }

  return (
    <Modal visible={visivel} transparent animationType="fade">
      <View style={s.overlay}>
        <View style={s.modal}>
          <Text style={s.emoji}>{pedido.restauranteEmoji}</Text>
          <Text style={s.titulo}>Como foi seu pedido?</Text>
          <Text style={s.sub}>{pedido.restaurante}</Text>

          {/* Estrelas interativas */}
          <View style={s.stars}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity
                key={n}
                onPress={() => {
                  Haptics.selectionAsync();
                  setNota(n);
                }}
              >
                <Ionicons
                  name={n <= nota ? 'star' : 'star-outline'}
                  size={36}
                  color={n <= nota ? C.amber : C.ink4}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.notaLabel}>
            {['', 'Ruim 😞', 'Regular 😐', 'Bom 😊', 'Muito bom 🤩', 'Excelente 🔥'][nota]}
          </Text>

          {/* Comentário */}
          <TextInput
            style={s.input}
            placeholder="Deixe um comentário (opcional)..."
            placeholderTextColor={C.ink4}
            multiline
            value={comentario}
            onChangeText={setComentario}
            maxLength={200}
          />
          <Text style={s.charCount}>{comentario.length}/200</Text>

          <PrimaryButton label="Enviar avaliação" onPress={enviar} />
          <TouchableOpacity style={s.pularBtn} onPress={onClose}>
            <Text style={s.pularTxt}>Agora não</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
```

**Integração na DetalhePedidoScreen:**

```jsx
const [showAvaliacao, setShowAvaliacao] = useState(false);

// No timer que avança o status:
if (novoStatus === 'entregue') {
  // Delay de 1s para mostrar o status "Entregue" antes do modal
  setTimeout(() => setShowAvaliacao(true), 1500);
}

// No render:
<ModalAvaliacao
  visivel={showAvaliacao}
  pedido={pedido}
  onClose={() => setShowAvaliacao(false)}
/>
```

### Requisitos Técnicos

- AsyncStorage — já instalado (via `services/storage.js`)
- `services/dados.js` — para `RESTAURANTES` e `formatarPreco`
- `CarrinhoContext` — para `adicionar`, `setRestaurante`
- `expo-haptics` — instalado pelo AGENT 05
- Sem dependências novas

### Critérios de Entrega

**Favoritos:**
- [ ] `services/recomendacao.js` com `getItensFavoritos()` funcional
- [ ] Seção "Favoritos seus 🔥" na HomeScreen com scroll horizontal
- [ ] Cards de item favorito: emoji, nome, preço, contagem "Nx pedido"
- [ ] Ao tocar no card → navega para RestauranteScreen do restaurante dono
- [ ] Seção não aparece se não há histórico de pedidos

**Repetir último pedido:**
- [ ] FAB no canto inferior direito da HomeScreen
- [ ] FAB com ícone de "repeat" e animação de pulso
- [ ] Ao tocar: popula CarrinhoContext com itens do último pedido e navega para CarrinhoScreen
- [ ] FAB não aparece se não há pedidos anteriores

**Avaliação:**
- [ ] `services/avaliacao.js` com `salvarAvaliacao()` e `getNotaMediaRestaurante()`
- [ ] Modal de avaliação com 5 estrelas interativas
- [ ] Rótulo de texto muda conforme nota selecionada
- [ ] Campo de comentário opcional com contador de caracteres
- [ ] Modal dispara 1.5s após pedido atingir status "entregue"
- [ ] Avaliação salva no AsyncStorage associada ao pedido
- [ ] Nota média do restaurante calculada a partir das avaliações

### Exemplos e Referências

Estrutura de uma avaliação salva:
```json
{
  "pedidoId": "1715978400000",
  "nota": 5,
  "comentario": "Pizza chegou quentinha e deliciosa!",
  "restauranteNome": "Pizza Napoli",
  "timestamp": "2024-05-17T20:30:00.000Z"
}
```

### Não Faça

- **Não crie backend de recomendação** — é estatística simples local
- **Não use machine learning** — é contagem de frequência pura
- **Não modifique a estrutura do objeto `pedido`** — use como está em `services/storage.js`
- **Não force o modal de avaliação** — o usuário pode pular ("Agora não")
- **Não crie a tela DetalhePedidoScreen** se o AGENT 09 ainda não a criou — adicione o modal à PedidosScreen como fallback
