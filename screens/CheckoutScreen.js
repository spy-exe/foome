import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Platform, TextInput, ScrollView,
  Modal, Alert, KeyboardAvoidingView,
} from 'react-native';
import { Feather, Ionicons } from '../components/Icon';
import Animated, {
  FadeIn,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatarPreco } from '../services/dados';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { useApp } from '../contexts/AppContext';
import { F, SHADOW } from '../constants/theme';
import { haptic } from '../utils/haptics';
import { verificarBiometria } from '../services/biometria';
import { criarPedido } from '../services/pedidos';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

const STORAGE_KEY = '@foome_enderecos';

const ETAPAS = ['Endereço', 'Pagamento', 'Revisão'];

const METODOS_PAGAMENTO = [
  { id: 'pix',     label: 'PIX',          sub: 'Aprovação instantânea', icon: 'smartphone' },
  { id: 'credito', label: 'Crédito',       sub: 'Visa, Master, Elo',    icon: 'credit-card' },
  { id: 'debito',  label: 'Débito',        sub: 'Visa, Master, Elo',    icon: 'credit-card' },
  { id: 'dinheiro',label: 'Dinheiro',      sub: 'Pague na entrega',     icon: 'dollar-sign' },
];

const ENDERECOS_MOCK = [
  { id: '1', label: 'Casa',      rua: 'Rua das Acácias', numero: '42', bairro: 'Centro', cidade: 'Vassouras', uf: 'RJ', complemento: '', referencia: '' },
  { id: '2', label: 'Trabalho',  rua: 'Av. Principal',    numero: '100', bairro: 'Centro', cidade: 'Vassouras', uf: 'RJ', complemento: 'Sala 302', referencia: '' },
];

/* ═══════════════════ ETAPA 1 — Endereço ═══════════════════ */
function StepEndereco({ enderecos, enderecoSel, onSelect, observacao, setObservacao, onAddEndereco, onDeleteEndereco }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  return (
    <Animated.View entering={FadeIn.duration(300)} style={s.stepContainer}>
      <Text style={s.stepTitle}>Endereço de entrega</Text>

      {enderecos.map(end => {
        const sel = enderecoSel?.id === end.id;
        return (
          <TouchableOpacity
            key={end.id}
            style={[s.card, sel && s.cardSel]}
            onPress={() => { haptic.select(); onSelect(end); }}
            activeOpacity={0.82}
          >
            <View style={s.cardRow}>
              <View style={[s.iconCircle, sel && s.iconCircleSel]}>
                <Feather name="map-pin" size={16} color={sel ? '#fff' : C.ink3} />
              </View>
              <View style={s.cardInfo}>
                <Text style={[s.cardLabel, sel && s.cardLabelSel]}>
                  {end.label || 'Endereço'}
                </Text>
                <Text style={s.cardSub}>{end.rua}, {end.numero} — {end.bairro}</Text>
                <Text style={s.cardSub}>{end.cidade}, {end.uf}</Text>
              </View>
              <View style={[s.radio, sel && s.radioSel]}>
                {sel && <View style={s.radioDot} />}
              </View>
            </View>
            <TouchableOpacity
              style={s.deleteEndBtn}
              onPress={() => { haptic.light(); onDeleteEndereco(end.id); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="trash-2" size={14} color={C.ink3} />
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={s.addEndBtn}
        onPress={() => { haptic.light(); onAddEndereco(); }}
        activeOpacity={0.82}
      >
        <Feather name="plus" size={16} color={C.brand} />
        <Text style={s.addEndTxt}>Adicionar novo endereço</Text>
      </TouchableOpacity>

      <Text style={[s.fieldLabel, { marginTop: 20 }]}>Observação para o entregador</Text>
      <TextInput
        style={s.obsInput}
        placeholder="Ex: Portão azul, campainha não funciona..."
        placeholderTextColor={C.ink3}
        value={observacao}
        onChangeText={setObservacao}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
    </Animated.View>
  );
}

/* ═══════════════════ ETAPA 2 — Pagamento ═══════════════════ */
function StepPagamento({ metodoSel, onSelectMetodo, troco, setTroco, semTroco, setSemTroco }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  return (
    <Animated.View entering={FadeIn.duration(300)} style={s.stepContainer}>
      <Text style={s.stepTitle}>Forma de pagamento</Text>

      {METODOS_PAGAMENTO.map(met => {
        const sel = metodoSel?.id === met.id;
        return (
          <TouchableOpacity
            key={met.id}
            style={[s.card, sel && s.cardSel]}
            onPress={() => { haptic.select(); onSelectMetodo(met); }}
            activeOpacity={0.82}
          >
            <View style={s.cardRow}>
              <View style={[s.iconCircle, sel && s.iconCircleSel]}>
                <Feather name={met.icon} size={16} color={sel ? '#fff' : C.ink3} />
              </View>
              <View style={s.cardInfo}>
                <Text style={[s.cardLabel, sel && s.cardLabelSel]}>{met.label}</Text>
                <Text style={s.cardSub}>{met.sub}</Text>
              </View>
              <View style={[s.radio, sel && s.radioSel]}>
                {sel && <View style={s.radioDot} />}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {metodoSel?.id === 'pix' && <SubPix />}
      {metodoSel?.id === 'credito' && <SubCartao tipo="Crédito" />}
      {metodoSel?.id === 'debito' && <SubCartao tipo="Débito" />}
      {metodoSel?.id === 'dinheiro' && <SubDinheiro troco={troco} setTroco={setTroco} semTroco={semTroco} setSemTroco={setSemTroco} />}
    </Animated.View>
  );
}

function SubPix() {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  return (
    <Animated.View entering={FadeIn.duration(300)} style={s.subCard}>
      <View style={s.qrPlaceholder}>
        <View style={s.qrPattern}>
          {Array.from({ length: 9 }).map((_, i) => (
            <View key={i} style={[s.qrDot, { backgroundColor: i % 2 === 0 ? C.ink : C.ink3 }]} />
          ))}
        </View>
      </View>
      <Text style={s.subLabel}>Valor a pagar:</Text>
      <Text style={s.subValorPix}>R$ 0,00</Text>
      <Text style={s.subCaption}>Copie o código PIX abaixo:</Text>
      <View style={s.pixCodeRow}>
        <View style={s.pixCodeBox}>
          <Text style={s.pixCodeTxt} numberOfLines={1}>
            00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000
          </Text>
        </View>
        <TouchableOpacity
          style={s.copyBtn}
          onPress={() => { haptic.select(); Alert.alert('Copiado!', 'Código PIX copiado.'); }}
          activeOpacity={0.8}
        >
          <Feather name="copy" size={16} color={C.brand} />
        </TouchableOpacity>
      </View>
      <View style={s.expiraRow}>
        <Feather name="clock" size={14} color={C.amber} />
        <Text style={s.expiraTxt}>O QR Code expira em 15:00</Text>
      </View>
    </Animated.View>
  );
}

function SubCartao({ tipo }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  return (
    <Animated.View entering={FadeIn.duration(300)} style={s.subCard}>
      <Text style={s.subLabel}>{tipo}</Text>
      <TextInput
        style={s.cartaoInput}
        placeholder="Número do cartão"
        placeholderTextColor={C.ink3}
        keyboardType="numeric"
        maxLength={19}
      />
      <TextInput
        style={s.cartaoInput}
        placeholder="Nome como no cartão"
        placeholderTextColor={C.ink3}
        autoCapitalize="words"
      />
      <View style={s.cartaoRow}>
        <TextInput
          style={[s.cartaoInput, s.cartaoInputHalf]}
          placeholder="MM/AA"
          placeholderTextColor={C.ink3}
          keyboardType="numeric"
          maxLength={5}
        />
        <TextInput
          style={[s.cartaoInput, s.cartaoInputHalf]}
          placeholder="CVV"
          placeholderTextColor={C.ink3}
          keyboardType="numeric"
          maxLength={4}
          secureTextEntry
        />
      </View>
      <Text style={s.mockNote}>Dados mock — nenhum pagamento será processado.</Text>
    </Animated.View>
  );
}

function SubDinheiro({ troco, setTroco, semTroco, setSemTroco }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  return (
    <Animated.View entering={FadeIn.duration(300)} style={s.subCard}>
      <Text style={s.subLabel}>Troco para quanto?</Text>
      <TextInput
        style={s.cartaoInput}
        placeholder="R$ 0,00"
        placeholderTextColor={C.ink3}
        keyboardType="numeric"
        value={troco}
        onChangeText={setTroco}
      />
      <TouchableOpacity
        style={s.checkRow}
        onPress={() => { haptic.select(); setSemTroco(!semTroco); if (!semTroco) setTroco(''); }}
        activeOpacity={0.8}
      >
        <View style={[s.checkbox, semTroco && s.checkboxOn]}>
          {semTroco && <Feather name="check" size={12} color="#fff" />}
        </View>
        <Text style={s.checkLabel}>Não preciso de troco</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ═══════════════════ ETAPA 3 — Revisão ═══════════════════ */
function StepRevisao({ endereco, metodo, observacao, total, restaurante, itens, taxaEntrega }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  return (
    <Animated.View entering={FadeIn.duration(300)} style={s.stepContainer}>
      <Text style={s.stepTitle}>Revise seu pedido</Text>

      <View style={s.revCard}>
        <View style={s.revHeader}>
          <Text style={s.revEmoji}>{restaurante?.emoji || '🍽️'}</Text>
          <View style={s.revHeaderInfo}>
            <Text style={s.revLabel}>Pedido em</Text>
            <Text style={s.revNome}>{restaurante?.nome}</Text>
          </View>
          <Text style={s.revCateg}>{restaurante?.categoria}</Text>
        </View>
      </View>

      <View style={s.revCard}>
        <Text style={s.revSectionTitle}>Itens</Text>
        {itens.map(item => (
          <View key={item.id} style={s.revItemRow}>
            <Text style={s.revItemQtd}>{item.qtd}×</Text>
            <Text style={s.revItemNome} numberOfLines={1}>{item.nome}</Text>
            <Text style={s.revItemPreco}>{formatarPreco(item.preco * item.qtd)}</Text>
          </View>
        ))}
      </View>

      {endereco && (
        <View style={s.revCard}>
          <Text style={s.revSectionTitle}>Entregar em</Text>
          <Text style={s.revEndLabel}>{endereco.label || 'Endereço'}</Text>
          <Text style={s.revEndDetalhe}>
            {endereco.rua}, {endereco.numero}{endereco.complemento ? ` - ${endereco.complemento}` : ''}
          </Text>
          <Text style={s.revEndDetalhe}>{endereco.bairro}, {endereco.cidade} — {endereco.uf}</Text>
          {observacao ? <Text style={s.revObs}>Obs: {observacao}</Text> : null}
        </View>
      )}

      {metodo && (
        <View style={s.revCard}>
          <Text style={s.revSectionTitle}>Pagamento</Text>
          <View style={s.revPagRow}>
            <Feather name={metodo.icon} size={16} color={C.ink2} />
            <Text style={s.revPagLabel}>{metodo.label}</Text>
          </View>
        </View>
      )}

      {restaurante?.tempo && (
        <View style={s.revCard}>
          <Text style={s.revSectionTitle}>Tempo estimado</Text>
          <Text style={s.revTempo}>{restaurante.tempo}</Text>
        </View>
      )}

      <View style={s.revTotalCard}>
        <View style={s.revLinha}>
          <Text style={s.revLinhaLabel}>Subtotal</Text>
          <Text style={s.revLinhaVal}>{formatarPreco(itens.reduce((s, i) => s + i.preco * i.qtd, 0))}</Text>
        </View>
        <View style={s.revLinha}>
          <Text style={s.revLinhaLabel}>Entrega</Text>
          <Text style={[s.revLinhaVal, taxaEntrega === 0 && { color: C.teal }]}>
            {taxaEntrega === 0 ? 'Grátis' : formatarPreco(taxaEntrega)}
          </Text>
        </View>
        <View style={s.revDivisor} />
        <View style={s.revLinha}>
          <Text style={s.revTotalLabel}>Total</Text>
          <Text style={s.revTotalVal}>{formatarPreco(total)}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

/* ═══════════════════ MODAL Novo Endereço ═══════════════════ */
function NovoEnderecoModal({ visible, onClose, onSave }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  const [label, setLabel] = useState('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');

  function limpar() {
    setLabel(''); setCep(''); setRua(''); setNumero('');
    setComplemento(''); setBairro(''); setCidade(''); setUf('');
  }

  function handleSave() {
    if (!rua.trim() || !numero.trim() || !bairro.trim()) {
      haptic.error();
      Alert.alert('Campos obrigatórios', 'Preencha Rua, Número e Bairro.');
      return;
    }
    haptic.success();
    onSave({
      id: Date.now().toString(),
      label: label.trim() || 'Endereço',
      rua: rua.trim(),
      numero: numero.trim(),
      complemento: complemento.trim(),
      bairro: bairro.trim(),
      cidade: cidade.trim() || 'Vassouras',
      uf: uf.trim().toUpperCase() || 'RJ',
      referencia: '',
    });
    limpar();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={[s.modalHeader, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={() => { haptic.select(); limpar(); onClose(); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="x" size={24} color={C.ink} />
          </TouchableOpacity>
          <Text style={s.modalTitle}>Novo endereço</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={s.modalBody} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={s.fieldLabel}>Identificação (opcional)</Text>
          <TextInput style={s.fieldInput} placeholder="Ex: Casa, Trabalho" placeholderTextColor={C.ink3} value={label} onChangeText={setLabel} />

          <Text style={s.fieldLabel}>CEP</Text>
          <TextInput style={s.fieldInput} placeholder="00000000" placeholderTextColor={C.ink3} keyboardType="numeric" value={cep} onChangeText={(v) => setCep(v.replace(/\D/g, '').slice(0, 8))} maxLength={8} />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 2 }}>
              <Text style={s.fieldLabel}>Rua *</Text>
              <TextInput style={s.fieldInput} placeholder="Rua" placeholderTextColor={C.ink3} value={rua} onChangeText={setRua} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Número *</Text>
              <TextInput style={s.fieldInput} placeholder="Nº" placeholderTextColor={C.ink3} value={numero} onChangeText={setNumero} keyboardType="numeric" />
            </View>
          </View>

          <Text style={s.fieldLabel}>Complemento</Text>
          <TextInput style={s.fieldInput} placeholder="Apto, Bloco, etc." placeholderTextColor={C.ink3} value={complemento} onChangeText={setComplemento} />

          <Text style={s.fieldLabel}>Bairro *</Text>
          <TextInput style={s.fieldInput} placeholder="Bairro" placeholderTextColor={C.ink3} value={bairro} onChangeText={setBairro} />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 2 }}>
              <Text style={s.fieldLabel}>Cidade</Text>
              <TextInput style={s.fieldInput} placeholder="Vassouras" placeholderTextColor={C.ink3} value={cidade} onChangeText={setCidade} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>UF</Text>
              <TextInput style={s.fieldInput} placeholder="RJ" placeholderTextColor={C.ink3} value={uf} onChangeText={(v) => setUf(v.toUpperCase())} maxLength={2} autoCapitalize="characters" />
            </View>
          </View>

          <TouchableOpacity style={s.modalSaveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={s.modalSaveTxt}>Salvar endereço</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ═══════════════════ BARRA DE PROGRESSO ═══════════════════ */
function ProgressBar({ etapaAtual }) {
  const s = useThemedStyles(makeStyles);
  return (
    <View style={s.progressContainer}>
      {ETAPAS.map((label, idx) => {
        const status = idx < etapaAtual ? 'done' : idx === etapaAtual ? 'active' : 'pending';
        return (
          <React.Fragment key={label}>
            <View style={s.progressCol}>
              <View style={[s.progressCircle, status === 'done' && s.progressCircleDone, status === 'active' && s.progressCircleActive, status === 'pending' && s.progressCirclePending]}>
                {status === 'done' ? (
                  <Feather name="check" size={14} color="#fff" />
                ) : (
                  <Text style={[s.progressNum, status === 'active' && s.progressNumActive]}>{idx + 1}</Text>
                )}
              </View>
              <Text style={[s.progressLabel, (status === 'done' || status === 'active') && s.progressLabelActive]}>{label}</Text>
            </View>
            {idx < ETAPAS.length - 1 && (
              <View style={[s.progressConnector, status === 'done' && s.progressConnectorDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

/* ═══════════════════ TELA PRINCIPAL ═══════════════════ */
export default function CheckoutScreen({ navigation }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { itens, restaurante, totalPreco, limpar } = useCarrinho();
  const { atualizarPedidosCount } = useApp();

  const [etapa, setEtapa] = useState(0);
  const [enderecos, setEnderecos] = useState([]);
  const [enderecoSel, setEnderecoSel] = useState(null);
  const [observacao, setObservacao] = useState('');
  const [metodoSel, setMetodoSel] = useState(null);
  const [troco, setTroco] = useState('');
  const [semTroco, setSemTroco] = useState(false);
  const [showNovoEndereco, setShowNovoEndereco] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);

  const taxaEntrega = !restaurante || itens.length === 0
    ? 0
    : restaurante.entrega === 'Gratis' || restaurante.entrega === 'Grátis'
      ? 0
      : parseFloat(String(restaurante.entrega).replace('R$ ', '').replace(',', '.'));
  const total = Math.max(totalPreco + taxaEntrega, 0);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((json) => {
      const dados = json ? JSON.parse(json) : [];
      if (dados.length === 0) {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ENDERECOS_MOCK));
        setEnderecos(ENDERECOS_MOCK);
      } else {
        setEnderecos(dados);
      }
    }).catch(() => setEnderecos(ENDERECOS_MOCK));
  }, []);

  useEffect(() => () => { if (toastRef.current) clearTimeout(toastRef.current); }, []);

  function showToast(msg) {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast(msg);
    toastRef.current = setTimeout(() => setToast(null), 2500);
  }

  async function salvarEnderecos(novos) {
    setEnderecos(novos);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novos));
  }

  function handleAddEndereco(dados) {
    const novos = [...enderecos, dados];
    salvarEnderecos(novos);
    setEnderecoSel(dados);
  }

  function handleDeleteEndereco(id) {
    const novos = enderecos.filter(e => e.id !== id);
    salvarEnderecos(novos);
    if (enderecoSel?.id === id) setEnderecoSel(novos[0] || null);
    haptic.light();
  }

  function avancarEtapa() {
    if (etapa === 0 && !enderecoSel) {
      haptic.error();
      Alert.alert('Selecione um endereço', 'Escolha o endereço de entrega para continuar.');
      return;
    }
    if (etapa === 1 && !metodoSel) {
      haptic.error();
      Alert.alert('Selecione o pagamento', 'Escolha a forma de pagamento para continuar.');
      return;
    }
    haptic.light();
    setEtapa(prev => Math.min(prev + 1, 2));
  }

  function voltarEtapa() {
    haptic.light();
    setEtapa(prev => Math.max(prev - 1, 0));
  }

  async function confirmarPedido() {
    if (confirmando) return;
    haptic.light();
    setConfirmando(true);

    try {
      const bio = await verificarBiometria();
      if (!bio.sucesso) {
        haptic.error();
        setConfirmando(false);
        Alert.alert('Confirmação', 'Confirme sua identidade para finalizar o pedido.');
        return;
      }

      haptic.success();

      const enderecoTexto = typeof enderecoSel === 'string'
        ? enderecoSel
        : (enderecoSel?.endereco || enderecoSel?.label || '');

      const pedido = await criarPedido({
        restauranteId: restaurante.id,
        itens,
        endereco: enderecoTexto || null,
        pagamento: metodoSel?.label || 'PIX',
      });

      await atualizarPedidosCount();
      limpar();

      navigation.replace('Confirmacao', { pedido });
    } catch (err) {
      haptic.error();
      setConfirmando(false);
      Alert.alert('Erro', err?.mensagem || 'Não foi possível confirmar. Tente novamente.');
    }
  }

  if (!restaurante || itens.length === 0) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <Feather name="shopping-bag" size={48} color={C.ink3} />
        <Text style={{ fontFamily: F.regular, fontSize: 15, color: C.ink3, marginTop: 12, textAlign: 'center' }}>
          Carrinho vazio. Adicione itens antes de continuar.
        </Text>
        <TouchableOpacity style={{ marginTop: 20, backgroundColor: C.ink, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 12 }} onPress={() => navigation.goBack()}>
          <Text style={{ fontFamily: F.heading, fontSize: 14, color: '#fff' }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const podeAvancar = etapa === 0 ? !!enderecoSel : etapa === 1 ? !!metodoSel : true;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.ink} />

      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => { haptic.select(); navigation.goBack(); }} style={s.backBtn} activeOpacity={0.8}>
          <Feather name="arrow-left" size={20} color={C.bg} />
        </TouchableOpacity>
        <Text style={s.headerTitulo}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ProgressBar etapaAtual={etapa} />

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        {etapa === 0 && (
          <StepEndereco
            enderecos={enderecos}
            enderecoSel={enderecoSel}
            onSelect={setEnderecoSel}
            observacao={observacao}
            setObservacao={setObservacao}
            onAddEndereco={() => setShowNovoEndereco(true)}
            onDeleteEndereco={handleDeleteEndereco}
          />
        )}
        {etapa === 1 && (
          <StepPagamento
            metodoSel={metodoSel}
            onSelectMetodo={setMetodoSel}
            troco={troco}
            setTroco={setTroco}
            semTroco={semTroco}
            setSemTroco={setSemTroco}
          />
        )}
        {etapa === 2 && (
          <StepRevisao
            endereco={enderecoSel}
            metodo={metodoSel}
            observacao={observacao}
            total={total}
            restaurante={restaurante}
            itens={itens}
            taxaEntrega={taxaEntrega}
          />
        )}
      </ScrollView>

      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        {etapa > 0 && (
          <TouchableOpacity style={s.footerVoltar} onPress={voltarEtapa} activeOpacity={0.8}>
            <Feather name="arrow-left" size={18} color={C.ink2} />
          </TouchableOpacity>
        )}
        {etapa < 2 ? (
          <TouchableOpacity style={[s.footerBtn, !podeAvancar && s.footerBtnOff]} onPress={avancarEtapa} disabled={!podeAvancar} activeOpacity={0.85}>
            <Text style={s.footerBtnTxt}>Continuar</Text>
            <Feather name="chevron-right" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[s.footerBtn, s.footerBtnConfirm, confirmando && s.footerBtnOff]} onPress={confirmarPedido} disabled={confirmando} activeOpacity={0.85}>
            <Feather name="shield" size={18} color="#fff" />
            <Text style={s.footerBtnTxt}>{confirmando ? 'Enviando pedido...' : 'Confirmar pedido'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <NovoEnderecoModal visible={showNovoEndereco} onClose={() => setShowNovoEndereco(false)} onSave={handleAddEndereco} />

      {toast && (
        <Animated.View style={[s.toast, { bottom: insets.bottom + 100 }]} entering={SlideInDown.duration(220)} exiting={SlideOutDown.duration(180)}>
          <Feather name="check-circle" size={18} color={C.teal} />
          <Text style={s.toastTxt}>{toast}</Text>
        </Animated.View>
      )}
    </View>
  );
}

/* ═══════════════════ ESTILOS ═══════════════════ */
const makeStyles = (C) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.ink,
    paddingHorizontal: 16, paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  headerTitulo: { flex: 1, fontFamily: F.heading, fontSize: 18, color: '#fff', textAlign: 'center' },

  progressContainer: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center',
    paddingHorizontal: 32, paddingVertical: 20, backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  progressCol: { alignItems: 'center', zIndex: 2 },
  progressCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  progressCircleDone: { backgroundColor: C.teal },
  progressCircleActive: { backgroundColor: C.ink },
  progressCirclePending: { backgroundColor: C.border },
  progressNum: { fontFamily: F.bold, fontSize: 13, color: '#fff' },
  progressNumActive: { color: '#fff' },
  progressLabel: { fontFamily: F.regular, fontSize: 11, color: C.ink3, marginTop: 6 },
  progressLabelActive: { color: C.ink, fontFamily: F.semibold },
  progressConnector: { flex: 1, height: 2, backgroundColor: C.border, marginTop: 15, marginHorizontal: -1, zIndex: 0 },
  progressConnectorDone: { backgroundColor: C.teal },

  scroll: { flex: 1 },
  stepContainer: { padding: 20 },
  stepTitle: { fontFamily: F.heading, fontSize: 17, color: C.ink, marginBottom: 16 },

  card: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 10, position: 'relative' },
  cardSel: { borderColor: C.ink, borderWidth: 2, backgroundColor: '#F0F0F8' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  iconCircleSel: { backgroundColor: C.ink },
  cardInfo: { flex: 1 },
  cardLabel: { fontFamily: F.semibold, fontSize: 14, color: C.ink2 },
  cardLabelSel: { color: C.ink },
  cardSub: { fontFamily: F.regular, fontSize: 12, color: C.ink3, marginTop: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.ink4, justifyContent: 'center', alignItems: 'center' },
  radioSel: { borderColor: C.ink },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.ink },
  deleteEndBtn: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

  addEndBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1.5, borderColor: C.brand, borderStyle: 'dashed', marginTop: 4 },
  addEndTxt: { fontFamily: F.semibold, fontSize: 14, color: C.brand },

  fieldLabel: { fontFamily: F.semibold, fontSize: 13, color: C.ink2, marginBottom: 6, marginTop: 4 },
  fieldInput: { backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 14 : 10, fontFamily: F.regular, fontSize: 14, color: C.ink, marginBottom: 8 },
  obsInput: { backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 12, fontFamily: F.regular, fontSize: 14, color: C.ink, minHeight: 80, textAlignVertical: 'top' },

  subCard: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16, marginTop: 12 },
  subLabel: { fontFamily: F.semibold, fontSize: 14, color: C.ink, marginBottom: 8 },
  subValorPix: { fontFamily: F.bold, fontSize: 28, color: C.ink, marginBottom: 12 },
  subCaption: { fontFamily: F.regular, fontSize: 12, color: C.ink3, marginBottom: 8 },

  qrPlaceholder: { width: 200, height: 200, alignSelf: 'center', backgroundColor: C.surface, borderRadius: 16, borderWidth: 2, borderColor: C.ink, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  qrPattern: { width: 120, height: 120, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 8 },
  qrDot: { width: 12, height: 12, borderRadius: 2 },

  pixCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pixCodeBox: { flex: 1, backgroundColor: C.bg, borderRadius: 10, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 10 },
  pixCodeTxt: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, color: C.ink2 },
  copyBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.brandLight, justifyContent: 'center', alignItems: 'center' },
  expiraRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: '#FFF4E8', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start' },
  expiraTxt: { fontFamily: F.bold, fontSize: 12, color: C.amber },

  cartaoInput: { backgroundColor: C.bg, borderRadius: 10, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 10, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 14, color: C.ink, marginBottom: 8 },
  cartaoRow: { flexDirection: 'row', gap: 10 },
  cartaoInputHalf: { flex: 1 },
  mockNote: { fontFamily: F.regular, fontSize: 11, color: C.ink3, fontStyle: 'italic', textAlign: 'center', marginTop: 4 },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: C.ink4, justifyContent: 'center', alignItems: 'center' },
  checkboxOn: { backgroundColor: C.ink, borderColor: C.ink },
  checkLabel: { fontFamily: F.regular, fontSize: 14, color: C.ink2 },

  revCard: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 10 },
  revHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  revEmoji: { fontSize: 28 },
  revHeaderInfo: { flex: 1 },
  revLabel: { fontFamily: F.regular, fontSize: 11, color: C.ink3, textTransform: 'uppercase', letterSpacing: 1 },
  revNome: { fontFamily: F.heading, fontSize: 16, color: C.ink, marginTop: 1 },
  revCateg: { fontFamily: F.regular, fontSize: 12, color: C.ink3, backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  revSectionTitle: { fontFamily: F.semibold, fontSize: 12, color: C.ink3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  revItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  revItemQtd: { fontFamily: F.semibold, fontSize: 14, color: C.ink2, width: 30 },
  revItemNome: { fontFamily: F.regular, fontSize: 14, color: C.ink, flex: 1 },
  revItemPreco: { fontFamily: F.bold, fontSize: 14, color: C.ink2 },
  revEndLabel: { fontFamily: F.semibold, fontSize: 14, color: C.ink },
  revEndDetalhe: { fontFamily: F.regular, fontSize: 13, color: C.ink2, marginTop: 1 },
  revObs: { fontFamily: F.regular, fontSize: 12, color: C.ink3, fontStyle: 'italic', marginTop: 4 },
  revPagRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  revPagLabel: { fontFamily: F.semibold, fontSize: 14, color: C.ink2 },
  revTempo: { fontFamily: F.bold, fontSize: 24, color: C.ink },
  revTotalCard: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16, marginTop: 4 },
  revLinha: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  revLinhaLabel: { fontFamily: F.regular, fontSize: 14, color: C.ink3 },
  revLinhaVal: { fontFamily: F.bold, fontSize: 14, color: C.ink2 },
  revDivisor: { height: 1, backgroundColor: C.border, marginVertical: 4 },
  revTotalLabel: { fontFamily: F.heading, fontSize: 16, color: C.ink },
  revTotalVal: { fontFamily: F.bold, fontSize: 24, color: C.ink },

  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.surface, paddingHorizontal: 20, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  footerVoltar: { width: 50, height: 50, borderRadius: 14, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
  footerBtn: { flex: 1, flexDirection: 'row', height: 52, borderRadius: 14, backgroundColor: C.ink, justifyContent: 'center', alignItems: 'center', gap: 6 },
  footerBtnConfirm: { backgroundColor: C.brand, height: 56, borderRadius: 16 },
  footerBtnOff: { opacity: 0.4 },
  footerBtnTxt: { fontFamily: F.semibold, fontSize: 16, color: '#fff' },

  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  modalTitle: { fontFamily: F.heading, fontSize: 17, color: C.ink },
  modalBody: { flex: 1, padding: 20 },
  modalSaveBtn: { backgroundColor: C.ink, borderRadius: 14, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  modalSaveTxt: { fontFamily: F.heading, fontSize: 16, color: '#fff' },

  toast: { position: 'absolute', left: 20, right: 20, zIndex: 30, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 14, ...SHADOW.float },
  toastTxt: { fontFamily: F.heading, fontSize: 14, color: C.ink, flex: 1 },
});
