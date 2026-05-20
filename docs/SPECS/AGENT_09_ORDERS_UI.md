# AGENT 09 — UI/UX PedidosScreen e Rastreamento
## Foome — Spec de Desenvolvimento

### Contexto

A PedidosScreen atual:
- FlatList com cards de pedido (emoji, nome, data, chips de itens, total)
- Status fixo "Confirmado" (verde) para todos os pedidos
- Empty state com CTA para Home
- `useFocusEffect` para recarregar ao focar a tela

Falta:
- Status dinâmico com cores diferentes por etapa
- Tela de detalhe do pedido com timeline animada
- Simulação de progresso do pedido
- Modal de avaliação pós-entrega (mencionado no AGENT 14, mas a base é aqui)

### Objetivo

1. **Status coloridos** — Confirmado (verde), Em preparo (amber), A caminho (azul), Entregue (cinza)
2. **Tela `DetalhePedidoScreen.js`** — ao clicar no card, abrir detalhes
3. **Timeline visual de 4 etapas** com animação de progresso (mock: avança a cada 10s)
4. **Simulação de entrega** — timer que atualiza status automaticamente
5. **Empty state** melhorado com ilustração e CTA

### Git Workflow

```bash
git checkout main
git pull origin main
git checkout -b feat/agent-09-orders-ui

git add .
git commit -m "feat(pedidos): adicionar status dinâmico com cores por etapa"
# feat(pedidos): criar DetalhePedidoScreen com timeline animada
# feat(pedidos): implementar simulação de progresso do pedido
# style(pedidos): melhorar empty state e cards

git push origin feat/agent-09-orders-ui
```

**Regras:**
- Mínimo 3 commits
- Nunca commitar direto na `main`
- Nunca fazer push forçado

### Arquivos a Modificar / Criar

#### MODIFICAR: `screens/PedidosScreen.js`

**Status coloridos por etapa:**

```jsx
const STATUS_CONFIG = {
  confirmado:  { label: 'Confirmado',  cor: C.teal, bg: C.tealLight,  icon: 'check-circle' },
  preparando:  { label: 'Em preparo',  cor: C.amber, bg: C.amberLight, icon: 'clock' },
  a_caminho:   { label: 'A caminho',   cor: '#2563EB', bg: '#EFF6FF', icon: 'truck' },
  entregue:    { label: 'Entregue',    cor: C.ink3, bg: C.bg,         icon: 'package' },
};
```

Badge de status no card:
```jsx
const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.confirmado;

<View style={[s.statusBadge, { backgroundColor: status.bg }]}>
  <Feather name={status.icon} size={11} color={status.cor} />
  <Text style={[s.statusTxt, { color: status.cor }]}>{status.label}</Text>
</View>
```

**Simulação de progresso:**

Quando um pedido é criado em `CarrinhoScreen`, ele nasce com status `'confirmado'`. Vamos usar um timer na `PedidosScreen` para avançar status de pedidos pendentes.

```jsx
useEffect(() => {
  const interval = setInterval(() => {
    setPedidos(prev => {
      let mudou = false;
      const novos = prev.map(p => {
        if (p.status === 'entregue') return p;
        if (p.status === 'confirmado') { mudou = true; return { ...p, status: 'preparando' }; }
        if (p.status === 'preparando') { mudou = true; return { ...p, status: 'a_caminho' }; }
        if (p.status === 'a_caminho')  { mudou = true; return { ...p, status: 'entregue' }; }
        return p;
      });
      if (mudou) {
        salvarPedidos(novos); // persistir novos status
        return novos;
      }
      return prev;
    });
  }, 10000); // Avança a cada 10 segundos

  return () => clearInterval(interval);
}, []);
```

**Card clicável → navegar para DetalhePedidoScreen:**

```jsx
<TouchableOpacity
  style={s.card}
  onPress={() => navigation.navigate('DetalhePedido', { pedido: item })}
  activeOpacity={0.9}
>
  {/* conteúdo do card */}
</TouchableOpacity>
```

#### NOVO: `screens/DetalhePedidoScreen.js`

Esta tela mostra os detalhes completos de um pedido com timeline animada.

```jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Platform, Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { formatarPreco } from '../services/dados';
import { C, F, SHADOW } from '../constants/theme';

const ETAPAS = [
  { key: 'confirmado',  label: 'Confirmado',   icon: 'check-circle', cor: C.teal },
  { key: 'preparando',  label: 'Em preparo',    icon: 'clock',       cor: C.amber },
  { key: 'a_caminho',   label: 'A caminho',     icon: 'truck',       cor: '#2563EB' },
  { key: 'entregue',    label: 'Entregue',      icon: 'package',     cor: C.ink3 },
];

export default function DetalhePedidoScreen({ route, navigation }) {
  const { pedido } = route.params;
  const [status, setStatus] = useState(pedido.status);
  const progressAnims = useRef(ETAPAS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const idx = ETAPAS.findIndex(e => e.key === prev);
        if (idx < ETAPAS.length - 1) return ETAPAS[idx + 1].key;
        return prev;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Animar etapa atual
  useEffect(() => {
    const idx = ETAPAS.findIndex(e => e.key === status);
    for (let i = 0; i <= idx; i++) {
      Animated.timing(progressAnims[i], {
        toValue: 1,
        duration: 400,
        delay: i * 100,
        useNativeDriver: true,
      }).start();
    }
  }, [status]);

  function isConcluida(idx) {
    return ETAPAS.findIndex(e => e.key === status) >= idx;
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={C.ink} />
        </TouchableOpacity>
        <Text style={s.titulo}>Detalhes do pedido</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Restaurante info */}
        <View style={s.restCard}>
          <Text style={{ fontSize: 40 }}>{pedido.restauranteEmoji}</Text>
          <Text style={s.restNome}>{pedido.restaurante}</Text>
          <Text style={s.restData}>{new Date(pedido.timestamp).toLocaleString('pt-BR')}</Text>
        </View>

        {/* Timeline */}
        <View style={s.timeline}>
          {ETAPAS.map((etapa, idx) => {
            const concluida = isConcluida(idx);
            const atual = ETAPAS.findIndex(e => e.key === status) === idx;

            return (
              <View key={etapa.key} style={s.timelineItem}>
                {/* Linha vertical */}
                {idx < ETAPAS.length - 1 && (
                  <View style={[s.timelineLine, concluida && { backgroundColor: etapa.cor }]} />
                )}

                {/* Ícone */}
                <Animated.View style={[
                  s.timelineDot,
                  concluida && { backgroundColor: etapa.cor, borderColor: etapa.cor },
                  atual && { transform: [{ scale: 1.15 }] },
                ]}>
                  <Feather
                    name={concluida ? 'check' : etapa.icon}
                    size={16}
                    color={concluida ? '#fff' : etapa.cor}
                  />
                </Animated.View>

                {/* Label */}
                <View style={s.timelineInfo}>
                  <Text style={[s.timelineLabel, concluida && { color: etapa.cor, fontFamily: F.bold }]}>
                    {etapa.label}
                  </Text>
                  {atual && !concluida && (
                    <Text style={s.timelineHint}>Aguarde...</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Itens do pedido */}
        <Text style={s.sectionLabel}>Itens do pedido</Text>
        {pedido.itens.map(item => (
          <View key={item.id} style={s.itemCard}>
            <Text style={{ fontSize: 28, marginRight: 12 }}>{item.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.itemNome}>{item.nome}</Text>
              <Text style={s.itemQtd}>{item.qtd}× {formatarPreco(item.preco)}</Text>
            </View>
            <Text style={[s.itemTotal, { color: pedido.restauranteCor || C.brand }]}>
              {formatarPreco(item.preco * item.qtd)}
            </Text>
          </View>
        ))}

        {/* Total */}
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalVal}>{formatarPreco(pedido.total)}</Text>
        </View>
      </ScrollView>
    </View>
  );
}
```

#### MODIFICAR: `navigation/HomeStack.js`

Adicionar a rota `DetalhePedido` ao Stack da Home (ou em um Stack separado):

```jsx
<Stack.Screen name="DetalhePedido" component={DetalhePedidoScreen} />
```

Ou, se os pedidos são acessíveis pela tab, colocar no TabNavigator ou em um Stack da tab Pedidos. O mais simples é adicionar ao Stack principal (RootNavigator) ou criar um `PedidosStack.js`:

Sugestão: Colocar no `RootNavigator` (Stack principal em App.js):
```jsx
<Stack.Screen name="DetalhePedido" component={DetalhePedidoScreen} />
```

### Requisitos Técnicos

- `Animated` do React Native (core) — para animações da timeline
- `services/storage.js` — para `salvarPedidos()` ao atualizar status
- Sem dependências novas

### Critérios de Entrega

- [ ] Status coloridos por etapa (4 cores diferentes + ícones)
- [ ] Timer de 10s avança status automaticamente (confirmado → preparando → a caminho → entregue)
- [ ] Status atualizado é persistido via `salvarPedidos()`
- [ ] Card de pedido é clicável → navega para DetalhePedido
- [ ] `DetalhePedidoScreen.js` criado com timeline visual de 4 etapas
- [ ] Timeline anima ao avançar etapa (ícone preenche + check)
- [ ] Timeline mostra linha vertical conectando as etapas
- [ ] Empty state com ilustração + CTA "Explorar restaurantes" → Home
- [ ] Badge de contagem na tab Pedidos (integrado com AGENT 04)
- [ ] Timer é limpo (`clearInterval`) ao desmontar a tela
- [ ] Se pedido já está "entregue", timer não afeta ele

### Exemplos e Referências

Estrutura da timeline:
```
  ●  Confirmado       ← concluído (verde, check)
  │
  ●  Em preparo       ← atual (amber, clock)
  │
  ○  A caminho         ← pendente (cinza)
  │
  ○  Entregue          ← pendente (cinza)
```

### Não Faça

- **Não implemente geolocalização real do entregador** — é mock
- **Não crie notificações push** — é simulação local
- **Não modifique a estrutura do objeto `pedido`** além de adicionar/atualizar `status`
- **Não adicione modal de avaliação** — o AGENT 14 fará isso (mas deixe o ponto de extensão: quando status chega a 'entregue')
- **Não crie tela de rastreamento com mapa** — apenas timeline visual
