# AGENT 07 — UI/UX RestauranteScreen
## Foome — Spec de Desenvolvimento

### Contexto

A RestauranteScreen atual tem:
- Header colorido com emoji/avaliação/tempo/entrega
- FlatList de produtos com Stepper
- CTA flutuante com contagem e valor
- Navegação pro Carrinho via route.params

O layout é funcional mas linear — todos os produtos em uma lista só, sem subcategorias, sem detalhes expandidos do produto, sem efeito parallax.

### Objetivo

1. **Header com efeito parallax** — expande/colapsa ao rolar a lista (emoji e nome diminuem)
2. **Tabs de subcategoria** — mock: Entradas, Principais, Bebidas, Sobremesas
3. **Cards de produto** melhorados — imagem placeholder colorida, Stepper integrado
4. **Bottom sheet de detalhes** — ao tocar no produto, expandir com opções (tamanho, observações)
5. **CTA flutuante** com badge animado
6. **Transições suaves** na abertura/fechamento do bottom sheet

### Git Workflow

```bash
git checkout main
git pull origin main
git checkout -b feat/agent-07-restaurant-ui

git add .
git commit -m "feat(restaurante): implementar header com efeito parallax"
# feat(restaurante): adicionar tabs de subcategoria e cards melhorados
# feat(restaurante): criar bottom sheet de detalhes do produto
# feat(restaurante): animar CTA flutuante e transições

git push origin feat/agent-07-restaurant-ui
```

**Regras:**
- Mínimo 3 commits
- Nunca commitar direto na `main`
- Nunca fazer push forçado

### Arquivos a Modificar / Criar

#### MODIFICAR: `screens/RestauranteScreen.js`

Este é o arquivo principal. Vai crescer bastante. Se ficar muito grande (>400 linhas), extrair subcomponentes.

**1. Header parallax**

```jsx
const HEADER_MAX = 220;
const HEADER_MIN = 100;
const SCROLL_OFFSET = HEADER_MAX - HEADER_MIN;

const scrollY = useRef(new Animated.Value(0)).current;

const headerHeight = scrollY.interpolate({
  inputRange: [0, SCROLL_OFFSET],
  outputRange: [HEADER_MAX, HEADER_MIN],
  extrapolate: 'clamp',
});

const emojiSize = scrollY.interpolate({
  inputRange: [0, SCROLL_OFFSET],
  outputRange: [44, 24],
  extrapolate: 'clamp',
});

const nomeSize = scrollY.interpolate({
  inputRange: [0, SCROLL_OFFSET],
  outputRange: [22, 16],
  extrapolate: 'clamp',
});

const headerOpacity = scrollY.interpolate({
  inputRange: [0, SCROLL_OFFSET / 2, SCROLL_OFFSET],
  outputRange: [1, 0.5, 0.3],
  extrapolate: 'clamp',
});
```

Header animado:
```jsx
<Animated.View style={[s.header, { backgroundColor: restaurante.cor, height: headerHeight }]}>
  <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
    <Feather name="arrow-left" size={20} color="#fff" />
  </TouchableOpacity>
  <Animated.View style={[s.headerInfo, { opacity: headerOpacity }]}>
    <Animated.Text style={{ fontSize: emojiSize, marginBottom: 6 }}>
      {restaurante.emoji}
    </Animated.Text>
    <Animated.Text style={[s.headerNome, { fontSize: nomeSize }]}>
      {restaurante.nome}
    </Animated.Text>
    <View style={s.badges}>
      {/* ... badges de avaliação, tempo, entrega ... */}
    </View>
  </Animated.View>
</Animated.View>
```

**2. Tabs de subcategoria**

Criar tabs mockadas com scroll horizontal — os produtos já estão categorizados implicitamente, mas vamos criar uma estrutura de subcategorias mock:

```jsx
const SUBCATEGORIAS = [
  { key: 'todas',       label: 'Todas' },
  { key: 'principais',  label: 'Principais' },
  { key: 'bebidas',     label: 'Bebidas' },
  { key: 'sobremesas',  label: 'Sobremesas' },
];

const [subCat, setSubCat] = useState('todas');
```

Para mockar, dividir os produtos do restaurante por tipo com base no emoji ou criar um mapeamento simples:

```jsx
// Classificação mockada dos produtos
function classificar(produto) {
  if (['🍔','🍕','🌮','🍝','🥩','🍖','🍣','🌯','🥗','🫕'].includes(produto.emoji)) return 'principais';
  if (['🥤','🍲','🍵','🧃'].includes(produto.emoji)) return 'bebidas';
  if (['🍮','🍫','🫐','🍓','🧁'].includes(produto.emoji)) return 'sobremesas';
  return 'principais'; // fallback
}

const produtosFiltrados = subCat === 'todas'
  ? restaurante.produtos
  : restaurante.produtos.filter(p => classificar(p) === subCat);
```

Tabs UI:
```jsx
<View style={s.subTabBar}>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.subTabRow}>
    {SUBCATEGORIAS.map(tab => {
      const ativa = subCat === tab.key;
      return (
        <TouchableOpacity
          key={tab.key}
          style={[s.subTab, ativa && s.subTabAtiva]}
          onPress={() => setSubCat(tab.key)}
        >
          <Text style={[s.subTabTxt, ativa && s.subTabTxtAtiva]}>{tab.label}</Text>
          {ativa && <View style={s.subTabBar2} />}
        </TouchableOpacity>
      );
    })}
  </ScrollView>
</View>
```

**3. Cards de produto melhorados**

```jsx
function ProdutoCard({ item, cor, onPress }) {
  const n = qtd(item.id);

  return (
    <TouchableOpacity
      style={s.card}
      activeOpacity={0.9}
      onPress={() => onPress(item)}
    >
      {/* Placeholder colorido por categoria */}
      <View style={[s.prodImg, { backgroundColor: cor + '18' }]}>
        <Text style={{ fontSize: 40 }}>{item.emoji}</Text>
      </View>

      <View style={s.prodInfo}>
        <Text style={s.prodNome}>{item.nome}</Text>
        <Text style={s.prodDesc} numberOfLines={2}>{item.descricao}</Text>
        <Text style={[s.prodPreco, { color: cor }]}>
          {formatarPreco(item.preco)}
        </Text>
      </View>

      <View style={{ alignSelf: 'flex-end' }}>
        <Stepper
          quantidade={n}
          cor={cor}
          onAdicionar={() => adicionar(item)}
          onRemover={() => remover(item.id)}
        />
      </View>
    </TouchableOpacity>
  );
}
```

**4. Bottom sheet de detalhes do produto**

Usar o componente `BottomSheet` do AGENT 11 se existir, ou criar inline:

```jsx
import { BottomSheet } from '../components/BottomSheet'; // se existir

const [produtoSelecionado, setProdutoSelecionado] = useState(null);

function abrirDetalhes(produto) {
  setProdutoSelecionado(produto);
}

// No render:
{produtoSelecionado && (
  <BottomSheet visible={!!produtoSelecionado} onClose={() => setProdutoSelecionado(null)}>
    <View style={s.sheetContent}>
      <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>
        {produtoSelecionado.emoji}
      </Text>
      <Text style={s.sheetNome}>{produtoSelecionado.nome}</Text>
      <Text style={s.sheetDesc}>{produtoSelecionado.descricao}</Text>

      <Text style={s.sheetSection}>Tamanho</Text>
      <View style={s.tamanhoRow}>
        {['P', 'M', 'G'].map(t => (
          <TouchableOpacity key={t} style={s.tamanhoBtn}>
            <Text style={s.tamanhoTxt}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.sheetSection}>Observações</Text>
      <TextInput
        style={s.obsInput}
        placeholder="Ex: sem cebola, molho à parte..."
        placeholderTextColor={C.ink4}
        multiline
      />

      <PrimaryButton
        label={`Adicionar · ${formatarPreco(produtoSelecionado.preco)}`}
        color={restaurante.cor}
        onPress={() => {
          adicionar(produtoSelecionado);
          setProdutoSelecionado(null);
        }}
        style={{ marginTop: 16 }}
      />
    </View>
  </BottomSheet>
)}
```

**Se o BottomSheet não existir**, criar um simples com Modal + Animated.View:

```jsx
function BottomSheetSimples({ visible, onClose, children }) {
  const translateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }).start();
    } else {
      Animated.timing(translateY, { toValue: 300, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <TouchableOpacity
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View style={[s.sheet, { transform: [{ translateY }] }]}>
        <View style={s.handle} />
        {children}
      </Animated.View>
    </View>
  );
}
```

**5. CTA flutuante animado com badge**

```jsx
// Badge animado quando totalItens muda
const badgeScale = useSharedValue(1);

useEffect(() => {
  if (totalItens > 0) {
    badgeScale.value = withSpring(1.3, {}, () => {
      badgeScale.value = withSpring(1);
    });
  }
}, [totalItens]);

const badgeStyle = useAnimatedStyle(() => ({
  transform: [{ scale: badgeScale.value }],
}));
```

CTA:
```jsx
{totalItens > 0 && (
  <Animated.View style={[s.cta, { backgroundColor: restaurante.cor }]}>
    <TouchableOpacity
      style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
      onPress={() => navigation.navigate('Carrinho')}
      activeOpacity={0.88}
    >
      <Animated.View style={[s.ctaBadge, badgeStyle]}>
        <Text style={s.ctaBadgeTxt}>{totalItens}</Text>
      </Animated.View>
      <Text style={s.ctaLabel}>Ver carrinho</Text>
      <Text style={s.ctaTotal}>{formatarPreco(totalPreco)}</Text>
    </TouchableOpacity>
  </Animated.View>
)}
```

### Critérios de Entrega

- [ ] Header parallax: expande (220px) → colapsa (100px) ao scrollar
- [ ] Emoji e nome diminuem suavemente com o scroll
- [ ] Tabs de subcategoria com scroll horizontal e indicador ativo
- [ ] Cards de produto com placeholder colorido (cor do restaurante com opacidade)
- [ ] Stepper integrado em cada card
- [ ] Bottom sheet ao tocar no produto com detalhes expandidos
- [ ] Opções de tamanho (P/M/G) mockadas no bottom sheet
- [ ] Campo de observações no bottom sheet
- [ ] CTA flutuante com badge que anima ao adicionar/remover itens
- [ ] Navegação pro Carrinho SEM route.params — usar CarrinhoContext
- [ ] Scroll da FlatList tem `onScroll` conectado ao Animated.Event para o parallax

### Exemplos e Referências

Parallax header — usar `Animated.event` no `onScroll` da FlatList:
```jsx
const handleScroll = Animated.event(
  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
  { useNativeDriver: false }
);

// Na FlatList:
<FlatList
  onScroll={handleScroll}
  scrollEventThrottle={16}
  // ...
/>
```

### Não Faça

- **Não use libs de terceiros para parallax** — Reanimated + Animated nativos bastam
- **Não crie subcategorias dinâmicas** — são mockadas (4 tabs fixas)
- **Não implemente persistência de observações** — são mockadas, só visuais
- **Não modifique `services/dados.js`**
- **Não adicione ScrollView dentro de FlatList** — o parallax usa ListHeaderComponent
