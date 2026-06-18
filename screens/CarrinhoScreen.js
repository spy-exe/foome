import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, StatusBar, Platform, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather, Ionicons } from '../components/Icon';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { verificarBiometria } from '../services/biometria';
import { criarPedido } from '../services/pedidos';
import { listarEnderecos, formatarEndereco } from '../services/enderecos';
import { validarCupom, listarCuponsPublicos } from '../services/cupons';
import { getStatusClube } from '../services/clube';
import CategoriaIcone from '../components/CategoriaIcone';
import { formatarPreco } from '../services/dados';
import { useApp } from '../contexts/AppContext';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { F, SHADOW } from '../constants/theme';
import { haptic } from '../utils/haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

const makePagamentos = (C) => ([
  { id: 'pix', label: 'PIX', icon: 'smartphone', cor: C.teal },
  { id: 'credito', label: 'Crédito', icon: 'credit-card', cor: C.amber },
  { id: 'debito', label: 'Débito', icon: 'credit-card', cor: C.brand },
]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function hapticSelection() {
  haptic.select();
}

function hapticSuccess() {
  haptic.success();
}

function hapticError() {
  haptic.error();
}

function hapticImpact() {
  haptic.medium();
}

function BioPulse() {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 600 }),
        withTiming(1, { duration: 600 }),
      ),
      -1,
      true,
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View style={[s.fingerprintOuter, pulseStyle]}>
      <Ionicons name="finger-print" size={50} color={C.brand} />
    </Animated.View>
  );
}

function SwipeableItem({ item, cor, onDelete }) {
  const s = useThemedStyles(makeStyles);
  const swipeRef = useRef(null);

  function renderRightActions() {
    return (
      <TouchableOpacity
        style={s.deleteAction}
        onPress={() => {
          haptic.light();
          swipeRef.current?.close();
          onDelete(item.id);
        }}
        activeOpacity={0.85}
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
      onSwipeableWillOpen={hapticSelection}
    >
      <View style={s.item}>
        <CategoriaIcone categoria={item.categoria} size={26} color={cor} />
        <View style={s.itemInfo}>
          <Text style={s.itemNome}>{item.nome}</Text>
          <Text style={s.itemUnit}>{formatarPreco(item.preco)} / un.</Text>
        </View>
        <View style={s.qtdChip}>
          <Text style={s.qtdTxt}>{item.qtd}×</Text>
        </View>
        <Text style={[s.itemTotal, { color: cor }]}>
          {formatarPreco(item.preco * item.qtd)}
        </Text>
      </View>
    </Swipeable>
  );
}

export default function CarrinhoScreen({ navigation }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  const PAGAMENTOS = makePagamentos(C);
  const { usuario, atualizarPedidosCount } = useApp();
  const { itens, restaurante, totalPreco, limpar, remover } = useCarrinho();
  const [restauranteSnapshot, setRestauranteSnapshot] = useState(restaurante);
  const [confirmando, setConfirmando] = useState(false);
  const [cupom, setCupom] = useState('');
  const [cupomAtivo, setCupomAtivo] = useState(null); // resultado de validarCupom (ok)
  const [cupomErro, setCupomErro] = useState(null);
  const [clubeNivel, setClubeNivel] = useState('Bronze');
  const [enderecos, setEnderecos] = useState([]);
  const [enderecoSelId, setEnderecoSelId] = useState(null);
  const [pagamentoSel, setPagamentoSel] = useState(PAGAMENTOS[0].id);
  const [showBioOverlay, setShowBioOverlay] = useState(false);
  const [bioStatus, setBioStatus] = useState('idle');
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    if (restaurante) setRestauranteSnapshot(restaurante);
  }, [restaurante]);

  useEffect(() => () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  }, []);

  // Nível do clube (libera cupons exclusivos).
  useEffect(() => {
    let ativo = true;
    getStatusClube().then((st) => { if (ativo) setClubeNivel(st.nivel); }).catch(() => {});
    return () => { ativo = false; };
  }, []);

  // Endereços reais (recarrega ao voltar de "adicionar endereço").
  useFocusEffect(
    React.useCallback(() => {
      let ativo = true;
      listarEnderecos()
        .then((lista) => {
          if (!ativo) return;
          setEnderecos(lista);
          setEnderecoSelId((atual) => atual || (lista.find((e) => e.default) || lista[0])?.id || null);
        })
        .catch(() => { if (ativo) setEnderecos([]); });
      return () => { ativo = false; };
    }, []),
  );

  const restauranteAtual = restaurante ?? restauranteSnapshot;

  const subtotal = totalPreco;
  const taxaEntregaBase = itens.length === 0 || !restauranteAtual
    ? 0
    : restauranteAtual.entrega === 'Gratis' || restauranteAtual.entrega === 'Grátis'
      ? 0
      : parseFloat(String(restauranteAtual.entrega).replace('R$ ', '').replace(',', '.')) || 0;

  // Re-valida o cupom ativo quando o subtotal muda (ex.: removeu itens e caiu
  // abaixo do mínimo).
  useEffect(() => {
    if (!cupomAtivo) return;
    const r = validarCupom(cupomAtivo.cupom.codigo, { subtotal, taxaEntrega: taxaEntregaBase, clubeNivel });
    if (r.ok) setCupomAtivo(r);
    else { setCupomAtivo(null); setCupomErro(r.mensagem); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  if (!restauranteAtual) return null;

  const desconto = cupomAtivo?.desconto || 0;
  const freteGratis = Boolean(cupomAtivo?.freteGratis);
  const taxaEntrega = freteGratis ? 0 : taxaEntregaBase;
  const total = Math.max(subtotal + taxaEntrega - desconto, 0);

  const cuponsDisponiveis = listarCuponsPublicos({ clubeNivel });
  const enderecoSel = enderecos.find((e) => e.id === enderecoSelId)
    || enderecos.find((e) => e.default)
    || enderecos[0]
    || null;

  function showToast(mensagem) {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ mensagem });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  }

  function aplicarCupom(codigoArg) {
    const codigo = (typeof codigoArg === 'string' ? codigoArg : cupom).trim();
    if (!codigo) return;
    const r = validarCupom(codigo, { subtotal, taxaEntrega: taxaEntregaBase, clubeNivel });
    setCupom(codigo.toUpperCase());
    if (r.ok) {
      setCupomAtivo(r);
      setCupomErro(null);
      hapticSuccess();
    } else {
      setCupomAtivo(null);
      setCupomErro(r.mensagem);
      hapticError();
    }
  }

  function removerCupom() {
    setCupomAtivo(null);
    setCupom('');
    setCupomErro(null);
    hapticSelection();
  }

  function removerItemCompleto(id) {
    const item = itens.find(i => i.id === id);
    if (!item) return;

    for (let i = 0; i < item.qtd; i += 1) remover(id);
    haptic.light();
  }

  function selecionarEndereco(id) {
    setEnderecoSelId(id);
    hapticSelection();
  }

  function irParaEnderecos() {
    hapticSelection();
    navigation.navigate('PerfilTab', { screen: 'Enderecos' });
  }

  function selecionarPagamento(id) {
    setPagamentoSel(id);
    hapticSelection();
  }

  async function confirmarPedido() {
    if (itens.length === 0 || !usuario || confirmando) {
      hapticError();
      return;
    }

    if (!enderecoSel) {
      hapticError();
      Alert.alert(
        'Endereço de entrega',
        'Adicione um endereço para receber seu pedido.',
        [
          { text: 'Agora não', style: 'cancel' },
          { text: 'Adicionar', onPress: irParaEnderecos },
        ],
      );
      return;
    }

    haptic.light();
    setConfirmando(true);
    setShowBioOverlay(true);
    setBioStatus('scanning');

    try {
      const result = await verificarBiometria();

      if (!result.sucesso) {
        setBioStatus('error');
        hapticError();
        await sleep(1000);
        setShowBioOverlay(false);
        setBioStatus('idle');
        Alert.alert('Biometria necessária', 'Confirme sua identidade para finalizar.');
        return;
      }

      setBioStatus('success');
      hapticImpact();
      await sleep(1200);

      const pagamento = PAGAMENTOS.find(pag => pag.id === pagamentoSel);
      const enderecoTexto = `${enderecoSel.apelido ? `${enderecoSel.apelido} · ` : ''}${formatarEndereco(enderecoSel)}`;
      await criarPedido({
        restauranteId: restauranteAtual.id,
        itens,
        endereco: enderecoTexto,
        pagamento: pagamento?.label ?? 'PIX',
      });
      await atualizarPedidosCount();
      hapticSuccess();

      setShowBioOverlay(false);
      setBioStatus('idle');
      Alert.alert(
        'Pedido confirmado!',
        `${restauranteAtual.nome} · ${formatarPreco(total)}`,
        [{
          text: 'OK',
          onPress: () => {
            hapticSelection();
            limpar();
            navigation.popToTop();
          },
        }],
      );
    } catch (err) {
      setBioStatus('error');
      hapticError();
      await sleep(700);
      setShowBioOverlay(false);
      setBioStatus('idle');
      Alert.alert('Erro', err?.mensagem || 'Não foi possível confirmar o pedido. Tente novamente.');
    } finally {
      setConfirmando(false);
    }
  }

  const renderCheckoutOptions = itens.length > 0 ? (
    <View style={s.checkout}>
      <Text style={s.sectionTitle}>Cupom de desconto</Text>
      <View style={s.cupomRow}>
        <View style={[s.cupomInput, cupomAtivo && s.cupomInputOk, cupomErro && s.cupomInputErr]}>
          <Feather name="tag" size={16} color={cupomAtivo ? C.teal : C.ink3} />
          <TextInput
            style={s.cupomTxtInput}
            placeholder="Tem um cupom?"
            placeholderTextColor={C.ink4}
            value={cupom}
            onChangeText={(v) => {
              setCupom(v);
              setCupomErro(null);
            }}
            autoCapitalize="characters"
            editable={!cupomAtivo}
            returnKeyType="done"
            onSubmitEditing={() => aplicarCupom()}
          />
          {cupomAtivo && (
            <Feather name="check-circle" size={16} color={C.teal} />
          )}
        </View>
        {!cupomAtivo ? (
          <TouchableOpacity
            style={s.cupomBtn}
            onPress={() => aplicarCupom()}
            activeOpacity={0.85}
          >
            <Text style={s.cupomBtnTxt}>Aplicar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[s.cupomBtn, s.cupomBtnClear]}
            onPress={removerCupom}
            activeOpacity={0.85}
          >
            <Feather name="x" size={15} color={C.ink3} />
          </TouchableOpacity>
        )}
      </View>

      {!cupomAtivo && cuponsDisponiveis.length > 0 && (
        <View style={s.cupomChips}>
          {cuponsDisponiveis.map((c) => (
            <TouchableOpacity
              key={c.codigo}
              style={[s.cupomChip, { borderColor: c.cor }]}
              onPress={() => aplicarCupom(c.codigo)}
              activeOpacity={0.85}
            >
              <Feather name="tag" size={11} color={c.cor} />
              <Text style={[s.cupomChipTxt, { color: c.cor }]}>{c.codigo}</Text>
              <Text style={s.cupomChipSub}>{c.titulo}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {cupomAtivo && (
        <View style={s.cupomOk}>
          <Feather name="check" size={12} color={C.teal} />
          <Text style={s.cupomOkTxt}>{cupomAtivo.mensagem}</Text>
        </View>
      )}
      {cupomErro && (
        <View style={s.cupomErr}>
          <Feather name="alert-circle" size={12} color={C.brand} />
          <Text style={s.cupomErrTxt}>{cupomErro}</Text>
        </View>
      )}

      <Text style={[s.sectionTitle, s.sectionGap]}>Endereço de entrega</Text>
      {enderecos.length === 0 ? (
        <TouchableOpacity style={s.endVazio} onPress={irParaEnderecos} activeOpacity={0.85}>
          <Feather name="plus" size={18} color={C.brand} />
          <View style={{ flex: 1 }}>
            <Text style={s.endVazioTitle}>Adicionar endereço</Text>
            <Text style={s.endVazioSub}>Você ainda não tem um endereço salvo</Text>
          </View>
          <Feather name="chevron-right" size={18} color={C.ink3} />
        </TouchableOpacity>
      ) : (
        <>
          {enderecos.map((end) => {
            const sel = enderecoSel?.id === end.id;
            return (
              <TouchableOpacity
                key={end.id}
                style={[s.enderecoCard, sel && s.enderecoCardSel]}
                onPress={() => selecionarEndereco(end.id)}
                activeOpacity={0.82}
              >
                <View style={[s.radio, sel && s.radioSel]}>
                  {sel && <View style={s.radioDot} />}
                </View>
                <View style={s.endInfo}>
                  <View style={s.endTitleRow}>
                    <Feather name="map-pin" size={14} color={sel ? C.brand : C.ink3} />
                    <Text style={[s.endLabel, sel && s.endLabelSel]}>{end.apelido || 'Endereço'}</Text>
                    {end.default && <Text style={s.endPadrao}>padrão</Text>}
                  </View>
                  <Text style={s.endEndereco} numberOfLines={1}>{formatarEndereco(end)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={s.endAddLink} onPress={irParaEnderecos} activeOpacity={0.8}>
            <Feather name="plus" size={14} color={C.brand} />
            <Text style={s.endAddLinkTxt}>Adicionar outro endereço</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={[s.sectionTitle, s.sectionGap]}>Forma de pagamento</Text>
      <View style={s.pagamentoRow}>
        {PAGAMENTOS.map(pag => {
          const sel = pagamentoSel === pag.id;
          return (
            <TouchableOpacity
              key={pag.id}
              style={[s.pagamentoCard, sel && s.pagamentoCardSel]}
              onPress={() => selecionarPagamento(pag.id)}
              activeOpacity={0.82}
            >
              <View style={[s.radio, sel && s.radioSel]}>
                {sel && <View style={s.radioDot} />}
              </View>
              <Feather name={pag.icon} size={18} color={sel ? pag.cor : C.ink3} />
              <Text style={[s.pagamentoLabel, sel && s.pagamentoLabelSel]}>{pag.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  ) : null;

  return (
    <GestureHandlerRootView style={s.gestureRoot}>
      <View style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

        <View style={s.header}>
          <TouchableOpacity
            onPress={() => {
              hapticSelection();
              navigation.goBack();
            }}
            style={s.backBtn}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={20} color={C.ink} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.titulo}>Carrinho</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <CategoriaIcone categoria={restauranteAtual.categoria} size={14} color={restauranteAtual.cor} />
              <Text style={s.restLabel}>{restauranteAtual.nome}</Text>
            </View>
          </View>
          <View style={s.headerSpacer} />
        </View>

        <FlatList
          data={itens}
          keyExtractor={i => i.id}
          contentContainerStyle={[s.lista, itens.length === 0 && s.listaVazia]}
          ItemSeparatorComponent={() => <View style={s.sep} />}
          renderItem={({ item }) => (
            <SwipeableItem
              item={item}
              cor={restauranteAtual.cor}
              onDelete={removerItemCompleto}
            />
          )}
          ListFooterComponent={renderCheckoutOptions}
          ListEmptyComponent={
            <View style={s.vazio}>
              <Feather name="shopping-bag" size={38} color={C.ink4} />
              <Text style={s.vazioTitulo}>Carrinho vazio</Text>
              <Text style={s.vazioSub}>Adicione itens do restaurante para continuar</Text>
            </View>
          }
        />

        <View style={s.footer}>
          <View style={s.resumo}>
            <View style={s.linha}>
              <Text style={s.linhaLabel}>Subtotal</Text>
              <Text style={s.linhaVal}>{formatarPreco(subtotal)}</Text>
            </View>
            <View style={s.linha}>
              <Text style={s.linhaLabel}>Entrega</Text>
              <Text style={[s.linhaVal, taxaEntrega === 0 && s.gratis]}>
                {taxaEntrega === 0 ? 'Grátis' : formatarPreco(taxaEntrega)}
              </Text>
            </View>
            {desconto > 0 && (
              <View style={s.linha}>
                <Text style={s.linhaLabel}>Cupom {cupomAtivo?.cupom.codigo}</Text>
                <Text style={s.descontoVal}>- {formatarPreco(desconto)}</Text>
              </View>
            )}
            {freteGratis && (
              <View style={s.linha}>
                <Text style={s.linhaLabel}>Cupom {cupomAtivo?.cupom.codigo}</Text>
                <Text style={s.descontoVal}>Frete grátis</Text>
              </View>
            )}
            <View style={[s.linha, s.totalRow]}>
              <Text style={s.totalLabel}>Total</Text>
              <Text style={[s.totalVal, { color: restauranteAtual.cor }]}>{formatarPreco(total)}</Text>
            </View>
          </View>

          <View style={s.bioHint}>
            <Ionicons name="finger-print" size={17} color={C.amber} />
            <Text style={s.bioHintTxt}>Confirmação segura por biometria</Text>
          </View>

          <TouchableOpacity
            testID="btn-finalizar"
            style={[s.btn, { backgroundColor: restauranteAtual.cor }, confirmando && s.btnOff]}
            onPress={confirmarPedido}
            disabled={confirmando || itens.length === 0}
            activeOpacity={0.85}
          >
            {!confirmando && (
              <Ionicons name="finger-print" size={20} color="#fff" style={s.btnIcon} />
            )}
            <Text style={s.btnTxt}>
              {confirmando ? 'Aguardando...' : 'Confirmar pedido'}
            </Text>
          </TouchableOpacity>
        </View>

        {showBioOverlay && (
          <Animated.View entering={FadeIn.duration(160)} style={s.bioOverlay}>
            <View style={s.bioModal}>
              {bioStatus === 'scanning' && (
                <>
                  <BioPulse />
                  <Text style={s.bioModalTitle}>Confirmar identidade</Text>
                  <Text style={s.bioModalSub}>Use sua digital ou Face ID</Text>
                </>
              )}
              {bioStatus === 'success' && (
                <Animated.View entering={ZoomIn.duration(240)} style={s.bioResult}>
                  <View style={s.checkCircle}>
                    <Feather name="check" size={40} color="#fff" />
                  </View>
                  <Text style={s.bioModalTitle}>Confirmado!</Text>
                </Animated.View>
              )}
              {bioStatus === 'error' && (
                <Animated.View entering={ZoomIn.duration(220)} style={s.bioResult}>
                  <View style={[s.checkCircle, s.errorCircle]}>
                    <Feather name="x" size={40} color="#fff" />
                  </View>
                  <Text style={s.bioModalTitle}>Falha na verificação</Text>
                </Animated.View>
              )}
            </View>
          </Animated.View>
        )}

        {toast && (
          <Animated.View
            style={s.toast}
            entering={SlideInDown.duration(220)}
            exiting={SlideOutDown.duration(180)}
          >
            <Feather name="check-circle" size={20} color={C.teal} />
            <Text style={s.toastTxt}>{toast.mensagem}</Text>
          </Animated.View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const makeStyles = (C) => StyleSheet.create({
  gestureRoot: { flex: 1 },
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.surface,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 13,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerSpacer: { width: 40 },
  titulo: { fontFamily: F.heading, fontSize: 17, color: C.ink },
  restLabel: { fontFamily: F.regular, fontSize: 12, color: C.ink3, marginTop: 2 },

  lista: { padding: 16, paddingBottom: 20 },
  listaVazia: { flexGrow: 1 },
  sep: { height: 8 },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 14,
    ...SHADOW.card,
  },
  itemEmoji: { fontSize: 24, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemNome: { fontFamily: F.semibold, fontSize: 14, color: C.ink },
  itemUnit: { fontFamily: F.regular, fontSize: 12, color: C.ink3, marginTop: 2 },
  qtdChip: {
    backgroundColor: C.bg,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  qtdTxt: { fontFamily: F.bold, fontSize: 13, color: C.ink2 },
  itemTotal: { fontFamily: F.bold, fontSize: 15, minWidth: 72, textAlign: 'right' },

  deleteAction: {
    width: 104,
    marginLeft: 8,
    borderRadius: 16,
    backgroundColor: C.brand,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    ...SHADOW.card,
  },
  deleteTxt: { fontFamily: F.bold, fontSize: 12, color: '#fff' },

  checkout: { paddingTop: 18 },
  sectionTitle: {
    fontFamily: F.heading,
    fontSize: 15,
    color: C.ink,
    marginBottom: 10,
  },
  sectionGap: { marginTop: 18 },

  cupomRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cupomInput: {
    flex: 1,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
  },
  cupomInputOk: { borderColor: C.teal, backgroundColor: C.tealLight },
  cupomInputErr: { borderColor: C.brandBorder, backgroundColor: C.brandLight },
  cupomTxtInput: {
    flex: 1,
    fontFamily: F.regular,
    fontSize: 14,
    color: C.ink,
    paddingVertical: 0,
  },
  cupomBtn: {
    height: 46,
    minWidth: 82,
    borderRadius: 14,
    backgroundColor: C.brand,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  cupomBtnClear: {
    minWidth: 46,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  cupomBtnTxt: { fontFamily: F.heading, fontSize: 13, color: '#fff' },
  cupomChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  cupomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: C.surface,
  },
  cupomChipTxt: { fontFamily: F.monoBold, fontSize: 11 },
  cupomChipSub: { fontFamily: F.medium, fontSize: 11, color: C.ink3 },
  cupomOk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  cupomOkTxt: { fontFamily: F.medium, fontSize: 12, color: C.teal },
  cupomErr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  cupomErrTxt: { fontFamily: F.medium, fontSize: 12, color: C.brand },

  enderecoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    marginBottom: 8,
  },
  enderecoCardSel: { borderColor: C.brandBorder, backgroundColor: C.brandLight },
  endVazio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.brandBorder,
    padding: 14,
  },
  endVazioTitle: { fontFamily: F.semibold, fontSize: 14, color: C.brand },
  endVazioSub: { fontFamily: F.regular, fontSize: 12, color: C.ink3, marginTop: 2 },
  endAddLink: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingLeft: 4 },
  endAddLinkTxt: { fontFamily: F.semibold, fontSize: 13, color: C.brand },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.ink4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSel: { borderColor: C.brand },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.brand,
  },
  endInfo: { flex: 1 },
  endTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  endLabel: { fontFamily: F.semibold, fontSize: 13, color: C.ink2 },
  endLabelSel: { color: C.brand },
  endPadrao: { fontFamily: F.monoBold, fontSize: 9, color: C.ink3, backgroundColor: C.bg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1, letterSpacing: 0.5 },
  endEndereco: { fontFamily: F.regular, fontSize: 12, color: C.ink3 },

  pagamentoRow: { flexDirection: 'row', gap: 8 },
  pagamentoCard: {
    flex: 1,
    minHeight: 88,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 10,
  },
  pagamentoCardSel: { borderColor: C.brandBorder, backgroundColor: C.brandLight },
  pagamentoLabel: { fontFamily: F.semibold, fontSize: 12, color: C.ink2 },
  pagamentoLabelSel: { color: C.brand },

  vazio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: 8,
  },
  vazioTitulo: { fontFamily: F.heading, fontSize: 17, color: C.ink2 },
  vazioSub: { fontFamily: F.regular, fontSize: 13, color: C.ink3, textAlign: 'center' },

  footer: {
    backgroundColor: C.surface,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  resumo: { marginBottom: 14 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  linhaLabel: { fontFamily: F.regular, fontSize: 14, color: C.ink3 },
  linhaVal: { fontFamily: F.semibold, fontSize: 14, color: C.ink2 },
  gratis: { color: C.teal },
  descontoVal: { fontFamily: F.semibold, fontSize: 14, color: C.teal },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: { fontFamily: F.heading, fontSize: 16, color: C.ink },
  totalVal: { fontFamily: F.headingLg, fontSize: 22 },

  bioHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.amberLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFD9A8',
  },
  bioHintTxt: { fontFamily: F.medium, fontSize: 12, color: '#92530A', flex: 1 },

  btn: {
    flexDirection: 'row',
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.float,
  },
  btnIcon: { marginRight: 10 },
  btnTxt: { fontFamily: F.heading, fontSize: 16, color: '#fff' },
  btnOff: { opacity: 0.55 },

  bioOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  bioModal: {
    width: '100%',
    maxWidth: 320,
    minHeight: 230,
    borderRadius: 22,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    ...SHADOW.float,
  },
  fingerprintOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: C.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: C.brandBorder,
  },
  bioModalTitle: {
    fontFamily: F.heading,
    fontSize: 18,
    color: C.ink,
    textAlign: 'center',
  },
  bioModalSub: {
    fontFamily: F.regular,
    fontSize: 13,
    color: C.ink3,
    marginTop: 6,
    textAlign: 'center',
  },
  bioResult: { alignItems: 'center' },
  checkCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: C.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  errorCircle: { backgroundColor: C.brand },

  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: Platform.OS === 'ios' ? 190 : 172,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...SHADOW.float,
  },
  toastTxt: { fontFamily: F.heading, fontSize: 14, color: C.ink, flex: 1 },
});
