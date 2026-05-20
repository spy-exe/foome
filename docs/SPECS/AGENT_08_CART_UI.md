# AGENT 08 — UI/UX CarrinhoScreen e Checkout
## Foome — Spec de Desenvolvimento

### Contexto

A CarrinhoScreen atual:
- Lista itens com FlatList, emoji, nome, quantidade, preço
- Resumo: subtotal, entrega, total
- Botão de confirmação com biometria
- Navega para PedidosScreen após confirmar
- Estado de "confirmando" com texto "Aguardando..."

Falta:
- Swipe-to-delete nos itens
- Cupom de desconto
- Seleção de endereço (mock)
- Seleção de forma de pagamento (mock)
- Animação de confirmação biométrica (overlay + digital pulsando + check verde)
- Toast de sucesso

### Objetivo

1. **Swipe-to-delete** nos itens do carrinho usando `react-native-gesture-handler`
2. **Cupom "FOOME10"** — aplica 10% com feedback verde
3. **Seleção de endereço** mockado (2-3 endereços com RadioButton)
4. **Seleção de pagamento** mockado (PIX, Crédito, Débito)
5. **Animação de confirmação biométrica** — overlay escurece, ícone digital pulsa, check verde
6. **Toast de sucesso** com slide-in após confirmar

### Git Workflow

```bash
git checkout main
git pull origin main
git checkout -b feat/agent-08-cart-ui

git add .
git commit -m "feat(cart): implementar swipe-to-delete nos itens"
# feat(cart): adicionar cupom de desconto com feedback visual
# feat(cart): criar seleção de endereço e pagamento mockados
# feat(cart): animar confirmação biométrica com overlay e toast

git push origin feat/agent-08-cart-ui
```

**Regras:**
- Mínimo 3 commits
- Nunca commitar direto na `main`
- Nunca fazer push forçado

### Arquivos a Modificar / Criar

#### MODIFICAR: `screens/CarrinhoScreen.js`

**1. Swipe-to-delete com react-native-gesture-handler**

O `react-native-gesture-handler` (~2.28.0) já está instalado. Usar `Swipeable`:

```jsx
import { Swipeable } from 'react-native-gesture-handler';

function SwipeableItem({ item, cor, onDelete }) {
  const swipeRef = useRef(null);

  function renderRightActions() {
    return (
      <TouchableOpacity
        style={[s.deleteAction, { backgroundColor: C.brand }]}
        onPress={() => {
          swipeRef.current?.close();
          onDelete(item.id);
        }}
      >
        <Feather name="trash-2" size={20} color="#fff" />
        <Text style={s.deleteTxt}>Remover</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      rightThreshold={40}
    >
      <View style={s.item}>
        {/* ... conteúdo do item ... */}
      </View>
    </Swipeable>
  );
}
```

No FlatList, usar `SwipeableItem` em vez do View direto. O `onDelete` chama `remover(id)` do CarrinhoContext (remove completamente, não decrementa).

**2. Cupom de desconto**

```jsx
const [cupom, setCupom] = useState('');
const [cupomAplicado, setCupomAplicado] = useState(false);
const [cupomErro, setCupomErro] = useState(false);

function aplicarCupom() {
  const codigo = cupom.trim().toUpperCase();
  if (codigo === 'FOOME10') {
    setCupomAplicado(true);
    setCupomErro(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } else {
    setCupomErro(true);
    setCupomAplicado(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
}

// Cálculo do desconto
const desconto = cupomAplicado ? subtotal * 0.1 : 0;
const total = subtotal + taxaEntrega - desconto;
```

UI do cupom:
```jsx
<View style={s.cupomRow}>
  <View style={s.cupomInput}>
    <Feather name="tag" size={16} color={cupomAplicado ? C.teal : C.ink3} />
    <TextInput
      style={s.cupomTxtInput}
      placeholder="Cupom de desconto"
      placeholderTextColor={C.ink4}
      value={cupom}
      onChangeText={v => { setCupom(v); setCupomErro(false); }}
      autoCapitalize="characters"
      editable={!cupomAplicado}
    />
    {cupomAplicado && (
      <Feather name="check-circle" size={16} color={C.teal} />
    )}
  </View>
  {!cupomAplicado ? (
    <TouchableOpacity
      style={[s.cupomBtn, { backgroundColor: C.brand }]}
      onPress={aplicarCupom}
    >
      <Text style={s.cupomBtnTxt}>Aplicar</Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      style={[s.cupomBtn, { backgroundColor: C.border }]}
      onPress={() => { setCupomAplicado(false); setCupom(''); }}
    >
      <Feather name="x" size={14} color={C.ink3} />
    </TouchableOpacity>
  )}
</View>
{cupomAplicado && (
  <View style={s.cupomOk}>
    <Feather name="check" size={12} color={C.teal} />
    <Text style={s.cupomOkTxt}>10% de desconto aplicado!</Text>
  </View>
)}
{cupomErro && (
  <View style={s.cupomErr}>
    <Feather name="alert-circle" size={12} color={C.brand} />
    <Text style={s.cupomErrTxt}>Cupom inválido. Tente FOOME10</Text>
  </View>
)}
```

**3. Seleção de endereço mockado**

```jsx
const ENDERECOS_MOCK = [
  { id: '1', label: 'Casa', endereco: 'Rua das Acácias, 42 - Vassouras, RJ', icon: 'home' },
  { id: '2', label: 'Trabalho', endereco: 'Av. Principal, 100 - Sala 302 - Vassouras, RJ', icon: 'briefcase' },
  { id: '3', label: 'Faculdade', endereco: 'Campus Universitário - Vassouras, RJ', icon: 'book-open' },
];

const [enderecoSel, setEnderecoSel] = useState(ENDERECOS_MOCK[0].id);
```

UI:
```jsx
<Text style={s.sectionTitle}>Endereço de entrega</Text>
{ENDERECOS_MOCK.map(end => {
  const sel = enderecoSel === end.id;
  return (
    <TouchableOpacity
      key={end.id}
      style={[s.enderecoCard, sel && s.enderecoCardSel]}
      onPress={() => setEnderecoSel(end.id)}
    >
      <View style={[s.radio, sel && s.radioSel]}>
        {sel && <View style={s.radioDot} />}
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Feather name={end.icon} size={14} color={sel ? C.brand : C.ink3} />
          <Text style={[s.endLabel, sel && s.endLabelSel]}>{end.label}</Text>
        </View>
        <Text style={s.endEndereco} numberOfLines={1}>{end.endereco}</Text>
      </View>
    </TouchableOpacity>
  );
})}
```

**4. Seleção de pagamento mockada**

```jsx
const PAGAMENTOS = [
  { id: 'pix', label: 'PIX', icon: 'smartphone', cor: C.teal },
  { id: 'credito', label: 'Crédito', icon: 'credit-card', cor: C.amber },
  { id: 'debito', label: 'Débito', icon: 'credit-card', cor: C.brand },
];

const [pagamentoSel, setPagamentoSel] = useState('pix');
```

UI similar à de endereço (RadioButton + ícone + label).

**5. Animação de confirmação biométrica**

```jsx
const [showBioOverlay, setShowBioOverlay] = useState(false);
const [bioStatus, setBioStatus] = useState('idle'); // 'idle' | 'scanning' | 'success' | 'error'

async function confirmarPedido() {
  setShowBioOverlay(true);
  setBioStatus('scanning');

  try {
    const result = await verificarBiometria();

    if (result.sucesso) {
      setBioStatus('success');
      await new Promise(r => setTimeout(r, 1200)); // pausa pra mostrar check

      // Salvar pedido
      const pedido = { /* ... */ };
      const anteriores = await getPedidos();
      await salvarPedidos([pedido, ...anteriores]);

      // Fechar overlay
      setShowBioOverlay(false);
      setBioStatus('idle');
      limpar();

      // Toast de sucesso (ver abaixo)
      showToast('Pedido confirmado! 🎉');
    } else {
      setBioStatus('error');
      await new Promise(r => setTimeout(r, 1000));
      setShowBioOverlay(false);
      setBioStatus('idle');
      Alert.alert('Falha', 'Não foi possível confirmar sua identidade.');
    }
  } catch (err) {
    setShowBioOverlay(false);
    setBioStatus('idle');
  }
}
```

Overlay de biometria:
```jsx
{showBioOverlay && (
  <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }]}>
      <View style={s.bioModal}>
        {bioStatus === 'scanning' && (
          <>
            <BioPulse />  {/* componente com animação de pulso */}
            <Text style={s.bioModalTitle}>Confirmar identidade</Text>
            <Text style={s.bioModalSub}>Use sua digital ou Face ID</Text>
          </>
        )}
        {bioStatus === 'success' && (
          <Animated.View entering={FadeIn.scaleDown()}>
            <View style={s.checkCircle}>
              <Feather name="check" size={40} color="#fff" />
            </View>
            <Text style={s.bioModalTitle}>Confirmado!</Text>
          </Animated.View>
        )}
        {bioStatus === 'error' && (
          <>
            <View style={[s.checkCircle, { backgroundColor: C.brand }]}>
              <Feather name="x" size={40} color="#fff" />
            </View>
            <Text style={s.bioModalTitle}>Falha na verificação</Text>
          </>
        )}
      </View>
    </View>
  </View>
)}
```

Digital pulsando (componente inline):
```jsx
function BioPulse() {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 600 }),
        withTiming(1, { duration: 600 }),
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View style={[s.fingerprintOuter, pulseStyle]}>
      <Ionicons name="finger-print" size={48} color={C.brand} />
    </Animated.View>
  );
}
```

**6. Toast de sucesso**

Se o AGENT 11 já criou `components/Toast.js`, usar. Senão, criar inline:

```jsx
const [toast, setToast] = useState(null); // { mensagem: string } ou null

function showToast(mensagem) {
  setToast({ mensagem });
  setTimeout(() => setToast(null), 3000);
}

// No render, antes do fechamento do root:
{toast && (
  <Animated.View style={s.toast} entering={SlideInDown} exiting={SlideOutDown}>
    <Feather name="check-circle" size={20} color={C.teal} />
    <Text style={s.toastTxt}>{toast.mensagem}</Text>
  </Animated.View>
)}
```

### Requisitos Técnicos

- `react-native-gesture-handler` ~2.28.0 — já instalado (Swipeable)
- `react-native-reanimated` ~4.1.1 — já instalado (animações)
- `expo-haptics` — será instalado pelo AGENT 05
- Compatível com `CarrinhoContext` do AGENT 01

### Critérios de Entrega

- [ ] Swipe-to-delete funcional em cada item do carrinho
- [ ] Ação de delete revela botão vermelho "Remover" ao arrastar
- [ ] Cupom "FOOME10" aplica 10% de desconto com feedback verde
- [ ] Cupom inválido mostra erro em vermelho
- [ ] Botão "Aplicar" vira "X" (remover cupom) após cupom aplicado
- [ ] 3 endereços mockados com RadioButton
- [ ] 3 formas de pagamento mockadas com RadioButton
- [ ] Overlay de biometria com digital pulsando
- [ ] Check verde animado após confirmação bem-sucedida
- [ ] Toast de sucesso com slide-in após confirmar pedido
- [ ] Carrinho limpo após confirmação (via `limpar()` do Context)
- [ ] Haptic feedback em todas as interações (swipe, cupom, confirmar)

### Não Faça

- **Não implemente integração real de pagamento** — é mock visual
- **Não persista endereços** — são mockados, não salvam no AsyncStorage
- **Não valide cupom no backend** — só "FOOME10" é válido, hardcoded
- **Não modifique o fluxo de biometria** — use `services/biometria.js` como está
- **Não altere `CarrinhoContext`** — use a interface existente
